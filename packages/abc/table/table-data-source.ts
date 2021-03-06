import { DecimalPipe } from '@angular/common';
import { Host, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { _HttpClient, CNCurrencyPipe, DatePipe, YNPipe } from '@delon/theme';
import { deepGet } from '@delon/util';

import { STSortMap } from './table-column-source';
import {
  STColumn,
  STData,
  STMultiSort,
  STPage,
  STReq,
  STRes,
  STRowClassName,
  STSingleSort,
} from './table.interfaces';

export interface STDataSourceOptions {
  pi?: number;
  ps?: number;
  data?: string | STData[] | Observable<STData[]>;
  total?: number;
  req?: STReq;
  res?: STRes;
  page?: STPage;
  columns?: STColumn[];
  singleSort?: STSingleSort;
  multiSort?: STMultiSort;
  rowClassName?: STRowClassName;
}

export interface STDataSourceResult {
  /** 是否需要显示分页器 */
  pageShow?: boolean;
  /** 新 `pi`，若返回 `undefined` 表示用户受控 */
  pi?: number;
  /** 新 `ps`，若返回 `undefined` 表示用户受控 */
  ps?: number;
  /** 新 `total`，若返回 `undefined` 表示用户受控 */
  total?: number;
  /** 数据 */
  list?: STData[];
}

@Injectable()
export class STDataSource {
  constructor(
    private http: _HttpClient,
    @Host() private currentyPipe: CNCurrencyPipe,
    @Host() private datePipe: DatePipe,
    @Host() private ynPipe: YNPipe,
    @Host() private numberPipe: DecimalPipe,
    private dom: DomSanitizer,
  ) { }

  process(options: STDataSourceOptions): Promise<STDataSourceResult> {
    return new Promise((resolvePromise, rejectPromise) => {
      let data$: Observable<STData[]>;
      let isRemote = false;
      const { data, res, total, page, pi, ps, columns } = options;
      let retTotal: number;
      let retPs: number;
      let retList: STData[];
      let retPi: number;
      let showPage = page.show;

      if (typeof data === 'string') {
        isRemote = true;
        data$ = this.getByHttp(data, options).pipe(
          map((result) => {
            let ret: STData[];
            if (Array.isArray(result)) {
              ret = result;
              retTotal = ret.length;
              retPs = retTotal;
              showPage = false;
            } else {
              // list
              ret = deepGet(result, res.reName.list as string[], []);
              if (ret == null || !Array.isArray(ret)) {
                ret = [];
              }
              // total
              const resultTotal = res.reName.total && deepGet(result, res.reName.total as string[], null);
              retTotal = resultTotal == null ? total || 0 : +resultTotal;
            }
            return ret;
          }),
          catchError(err => {
            rejectPromise(err);
            return [];
          }),
        );
      } else if (Array.isArray(data)) {
        data$ = of(data);
      } else {
        // a cold observable
        data$ = data;
      }

      if (!isRemote) {
        data$ = data$.pipe(
          // sort
          map((result: STData[]) => {
            let copyResult = result.slice(0);
            const sorterFn = this.getSorterFn(columns);
            if (sorterFn) {
              copyResult = copyResult.sort(sorterFn);
            }
            return copyResult;
          }),
          // filter
          map((result: STData[]) => {
            columns.filter(w => w.filter).forEach(c => {
              const values = c.filter.menus.filter(w => w.checked);
              if (values.length === 0) return;
              const onFilter = c.filter.fn;
              if (typeof onFilter !== 'function') {
                console.warn(`[st] Muse provide the fn function in filter`);
                return;
              }
              result = result.filter(record =>
                values.some(v => onFilter(v, record)),
              );
            });
            return result;
          }),
          // paging
          map((result: STData[]) => {
            if (page.front) {
              const maxPageIndex = Math.ceil(result.length / ps);
              retPi = Math.max(1, pi > maxPageIndex ? maxPageIndex : pi);
              retTotal = result.length;
              if (page.show === true) {
                return result.slice((retPi - 1) * ps, retPi * ps);
              }
            }
            return result;
          }),
        );
      }

      // pre-process
      if (typeof res.process === 'function') {
        data$ = data$.pipe(map(result => res.process(result)));
      }
      // data accelerator
      data$ = data$.pipe(
        map(result => {
          for (let i = 0, len = result.length; i < len; i++) {
            result[i]._values = columns.map(c => this.get(result[i], c, i));
            if (options.rowClassName) {
              result[i]._rowClassName = options.rowClassName(result[i], i);
            }
          }
          return result;
        }),
      );

      data$.forEach((result: STData[]) => (retList = result)).then(() => {
        const realTotal = retTotal || total;
        const realPs = retPs || ps;
        resolvePromise({
          pi: retPi,
          ps: retPs,
          total: retTotal,
          list: retList,
          pageShow: typeof showPage === 'undefined' ? realTotal > realPs : showPage,
        });
      });
    });
  }

  private get(item: STData, col: STColumn, idx: number) {
    if (col.format) {
      const formatRes = col.format(item, col);
      if (~formatRes.indexOf('<')) {
        return this.dom.bypassSecurityTrustHtml(formatRes);
      }
      return formatRes;
    }

    const value = deepGet(item, col.index as string[], col.default);

    let ret = value;
    switch (col.type) {
      case 'no':
        ret = col.noIndex + idx;
        break;
      case 'img':
        ret = value ? `<img src="${value}" class="img">` : '';
        break;
      case 'number':
        ret = this.numberPipe.transform(value, col.numberDigits);
        break;
      case 'currency':
        ret = this.currentyPipe.transform(value);
        break;
      case 'date':
        ret = this.datePipe.transform(value, col.dateFormat);
        break;
      case 'yn':
        ret = this.ynPipe.transform(value === col.yn.truth, col.yn.yes, col.yn.no);
        break;
    }
    return ret == null ? '' : ret;
  }

  private getByHttp(
    url: string,
    options: STDataSourceOptions,
  ): Observable<{}> {
    const { req, page, pi, ps, singleSort, multiSort, columns } = options;
    const method = (req.method || 'GET').toUpperCase();
    const params = {
      [req.reName.pi]: page.zeroIndexed ? pi - 1 : pi,
      [req.reName.ps]: ps,
      ...req.params,
      ...this.getReqSortMap(singleSort, multiSort, columns),
      ...this.getReqFilterMap(columns),
    };
    // tslint:disable-next-line:no-any
    let reqOptions: any = {
      params,
      body: req.body,
      headers: req.headers,
    };
    if (method === 'POST' && req.allInBody === true) {
      reqOptions = {
        body: { ...req.body, ...params },
        headers: req.headers,
      };
    }
    return this.http.request(method, url, reqOptions);
  }

  //#region sort

  private getValidSort(columns: STColumn[]): STSortMap[] {
    return columns
      .filter(item => item._sort && item._sort.enabled && item._sort.default)
      .map(item => item._sort);
  }

  private getSorterFn(columns: STColumn[]) {
    const sortList = this.getValidSort(columns);
    if (sortList.length === 0) {
      return;
    }
    if (typeof sortList[0].compare !== 'function') {
      console.warn(`[st] Muse provide the compare function in sort`);
      return;
    }

    return (a: STData, b: STData) => {
      const result = sortList[0].compare(a, b);
      if (result !== 0) {
        return sortList[0].default === 'descend' ? -result : result;
      }
      return 0;
    };
  }

  getReqSortMap(
    singleSort: STSingleSort,
    multiSort: STMultiSort,
    columns: STColumn[],
  ): { [key: string]: string } {
    let ret: { [key: string]: string } = {};
    const sortList = this.getValidSort(columns);
    if (!multiSort && sortList.length === 0) return ret;

    if (multiSort) {
      const ms = {
        key: 'sort',
        separator: '-',
        nameSeparator: '.',
        ...multiSort,
      };
      sortList.forEach(item => {
        ret[item.key] = (item.reName || {})[item.default] || item.default;
      });
      // 合并处理
      ret = {
        [ms.key]: Object.keys(ret)
          .map(key => key + ms.nameSeparator + ret[key])
          .join(ms.separator),
      };
    } else {
      const mapData = sortList[0];
      let sortFiled = mapData.key;
      let sortValue = (sortList[0].reName || {})[mapData.default] || mapData.default;
      if (singleSort) {
        sortValue = sortFiled + (singleSort.nameSeparator || '.') + sortValue;
        sortFiled = singleSort.key || 'sort';
      }
      ret[sortFiled] = sortValue;
    }
    return ret;
  }

  //#endregion

  //#region filter

  private getReqFilterMap(columns: STColumn[]): { [key: string]: string } {
    let ret = {};
    columns.filter(w => w.filter && w.filter.default === true).forEach(col => {
      const values = col.filter.menus.filter(f => f.checked === true);
      let obj: {} = {};
      if (col.filter.reName) {
        obj = col.filter.reName(col.filter.menus, col);
      } else {
        obj[col.filter.key] = values.map(i => i.value).join(',');
      }
      ret = { ...ret, ...obj };
    });
    return ret;
  }

  //#endregion
}
