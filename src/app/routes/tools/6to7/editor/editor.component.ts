import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ConverterService } from '../transform/converter.service';

@Component({
    selector: 'app-six-to-seven',
    templateUrl: './editor.component.html',
    providers: [ ConverterService ],
})
export class SixToSevenEditorComponent implements OnInit {

    source: string = `
    <pro-header [title]="'高级表单'">
        <ng-template #content>高级表单常见于一次性输入和提交大批量数据的场景。（示例采用响应式表单，也可使用模板驱动方式）</ng-template>
    </pro-header>
    <form nz-form [formGroup]="form" (ngSubmit)="_submitForm()" [nzLayout]="'vertical'">
        <nz-card [nzBordered]="false" nzTitle="仓库管理">
            <div nz-row [nzGutter]="16">
                <div nz-col nzMd="6" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>仓库名</label></div>
                        <div nz-form-control nz-col nzHasFeedback [nzValidateStatus]="name">
                            <nz-input formControlName="name" nzPlaceHolder="请输入仓库名称" nzSize="large"></nz-input>
                            <p nz-form-explain *ngIf="(name.dirty || name.touched) && name.errors?.required">
                                请输入仓库名称
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:6, offset:2}" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>仓库域名</label></div>
                        <div nz-form-control nz-col nzHasFeedback [nzValidateStatus]="url">
                            <nz-input formControlName="url" nzPlaceHolder="请输入" nzSize="large">
                                <ng-template #addOnBefore>http://</ng-template>
                                <ng-template #addOnAfter>.com</ng-template>
                            </nz-input>
                            <p nz-form-explain *ngIf="(url.dirty || url.touched) && url.errors?.required">
                                请输入仓库域名
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:8, offset:2}" nzSm="24" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>仓库管理员</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="owner">
                            <nz-select formControlName="owner" [nzPlaceHolder]="'请选择管理员'" [nzShowSearch]="true" nzSize="large">
                                <nz-option *ngFor="let i of users" [nzLabel]="i.label" [nzValue]="i.value">
                                </nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(owner.dirty || owner.touched) && owner.errors?.required">
                                请选择管理员
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div nz-row [nzGutter]="16">
                <div nz-col nzMd="6" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>审批员</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="approver">
                            <nz-select formControlName="approver" [nzPlaceHolder]="'请选择管理员'" [nzShowSearch]="true" nzSize="large">
                                <nz-option *ngFor="let i of users" [nzLabel]="i.label" [nzValue]="i.value">
                                </nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(approver.dirty || approver.touched) && approver.errors?.required">
                                请选择审批员
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:6, offset:2}" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>生效日期</label></div>
                        <div nz-form-control>
                            <div nz-col [nzSpan]="11">
                                <div nz-form-item nz-row>
                                    <div nz-form-control [nzValidateStatus]="time_start">
                                        <nz-datepicker formControlName="time_start" [nzPlaceHolder]="'开始日期'"></nz-datepicker>
                                        <p nz-form-explain *ngIf="(time_start.dirty || time_start.touched) && time_start.errors?.required">
                                            请选择开始日期
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div nz-col [nzSpan]="2">
                                <p nz-form-split>-</p>
                            </div>
                            <div nz-col [nzSpan]="11">
                                <div nz-form-item nz-row>
                                    <div nz-form-control [nzValidateStatus]="time_end">
                                        <nz-datepicker formControlName="time_end" [nzPlaceHolder]="'结束日期'"></nz-datepicker>
                                        <p nz-form-explain *ngIf="(time_end.dirty || time_end.touched) && time_end.errors?.required">
                                            请选择结束日期
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:8, offset:2}" nzSm="24" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>仓库类型</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="type">
                            <nz-select formControlName="type" nzSize="large" [nzShowSearch]="true" [nzPlaceHolder]="'请选择仓库类型'">
                                <nz-option [nzLabel]="'私密'" [nzValue]="'private'"></nz-option>
                                <nz-option [nzLabel]="'公开'" [nzValue]="'public'"></nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(type.dirty || type.touched) && type.errors?.required">
                                请选择仓库类型
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </nz-card>
        <nz-card [nzBordered]="false" nzTitle="任务管理">
            <div nz-row [nzGutter]="16">
                <div nz-col nzMd="6" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>任务名</label></div>
                        <div nz-form-control nz-col nzHasFeedback [nzValidateStatus]="name2">
                            <nz-input formControlName="name2" nzPlaceHolder="请输入任务名" nzSize="large"></nz-input>
                            <p nz-form-explain *ngIf="(name2.dirty || name2.touched) && name2.errors?.required">
                                请输入任务名
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:6, offset:2}" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>任务描述</label></div>
                        <div nz-form-control nz-col nzHasFeedback [nzValidateStatus]="summary">
                            <nz-input formControlName="summary" [nzType]="'textarea'" [nzAutosize]="true" nzPlaceHolder="请输入任务描述" nzSize="large"></nz-input>
                            <p nz-form-explain *ngIf="(summary.dirty || summary.touched) && summary.errors?.required">
                                请输入任务描述
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:8, offset:2}" nzSm="24" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>执行人</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="owner2">
                            <nz-select formControlName="owner2" [nzPlaceHolder]="'请选择执行人'" [nzShowSearch]="true" nzSize="large">
                                <nz-option *ngFor="let i of users" [nzLabel]="i.label" [nzValue]="i.value">
                                </nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(owner2.dirty || owner2.touched) && owner2.errors?.required">
                                请选择执行人
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div nz-row [nzGutter]="16">
                <div nz-col nzMd="6" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>责任人</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="approver2">
                            <nz-select formControlName="approver2" [nzPlaceHolder]="'请选择责任人'" [nzShowSearch]="true" nzSize="large">
                                <nz-option *ngFor="let i of users" [nzLabel]="i.label" [nzValue]="i.value">
                                </nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(approver2.dirty || approver2.touched) && approver2.errors?.required">
                                请选择责任人
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:6, offset:2}" nzSm="12" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>生效时间</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="time">
                            <nz-timepicker formControlName="time" nzPlaceHolder="请选择" nzSize="large"></nz-timepicker>
                            <p nz-form-explain *ngIf="(time.dirty || time.touched) && time.errors?.required">
                                请选择生效时间
                            </p>
                        </div>
                    </div>
                </div>
                <div nz-col [nzMd]="{span:8, offset:2}" nzSm="24" nzXs="24">
                    <div nz-form-item nz-row>
                        <div nz-form-label nz-col><label>任务类型</label></div>
                        <div nz-form-control nz-col [nzValidateStatus]="type2">
                            <nz-select formControlName="type2" nzSize="large" [nzShowSearch]="true" [nzPlaceHolder]="'请选择任务类型'">
                                <nz-option [nzLabel]="'私密'" [nzValue]="'private'"></nz-option>
                                <nz-option [nzLabel]="'公开'" [nzValue]="'public'"></nz-option>
                            </nz-select>
                            <p nz-form-explain *ngIf="(type2.dirty || type2.touched) && type2.errors?.required">
                                请选择任务类型
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </nz-card>
        <nz-card [nzBordered]="false" nzTitle="成员管理">
            <nz-table formArrayName="items" [nzDataSource]="items.value" [nzIsPagination]="false">
                <thead nz-thead>
                    <tr>
                        <th nz-th>成员姓名</th>
                        <th nz-th>工号</th>
                        <th nz-th>所属部门</th>
                        <th nz-th>操作</th>
                    </tr>
                </thead>
                <tbody nz-tbody>
                    <tr nz-tbody-tr *ngFor="let item of items.controls; let i = index" [formGroupName]="i">
                        <td nz-td>
                            <span *ngIf="editIndex!==i">{{items.value[i].name}}</span>
                            <span *ngIf="editIndex===i" nz-form-control [nzValidateStatus]="item.controls.name">
                                <nz-input formControlName="name" nzPlaceHolder="请输入成员姓名" nzSize="large"></nz-input>
                            </span>
                        </td>
                        <td nz-td>
                            <span *ngIf="editIndex!==i">{{items.value[i].workId}}</span>
                            <span *ngIf="editIndex===i" nz-form-control [nzValidateStatus]="item.controls.workId">
                                <nz-input formControlName="workId" nzPlaceHolder="请输入工号" nzSize="large"></nz-input>
                            </span>
                        </td>
                        <td nz-td>
                            <span *ngIf="editIndex!==i">{{items.value[i].department}}</span>
                            <span *ngIf="editIndex===i" nz-form-control [nzValidateStatus]="item.controls.department">
                                <nz-input formControlName="department" nzPlaceHolder="请输入所属部门" nzSize="large"></nz-input>
                            </span>
                        </td>
                        <td nz-td>
                            <span *ngIf="editIndex!==i">
                                <a (click)="edit(i)">编辑</a>
                                <span nz-table-divider></span>
                                <nz-popconfirm (nzOnConfirm)="del(i)" [nzTitle]="'是否要删除此行？'">
                                    <a nz-popconfirm>删除</a>
                                </nz-popconfirm>
                            </span>
                            <span *ngIf="editIndex===i">
                                <a (click)="save(i)">保存</a>
                                <span nz-table-divider></span>
                                <nz-popconfirm (nzOnConfirm)="cancel(i)" [nzTitle]="'是否要取消操作？'">
                                    <a nz-popconfirm>取消</a>
                                </nz-popconfirm>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </nz-table>
            <button *ngIf="editIndex===-1" nz-button [nzType]="'dashed'" [nzSize]="'large'" (click)="add()" class="ant-btn__block mt-md">
                <i nz-icon type="plus"></i>
                <span>新增成员</span>
            </button>
        </nz-card>
        <footer-toolbar errorCollect>
            <button nz-button [nzType]="'primary'" nzSize="large">提交</button>
        </footer-toolbar>
    </form>
    `;
    result: string;
    doing = false;

    constructor(private converterService: ConverterService, private msg: NzMessageService) {}

    ngOnInit(): void {
        this.run();
    }

    run() {
        this.doing = true;
        this.converterService.run(this.source).then(res => {
            this.doing = false;
            if (!res.ok) {
                this.msg.error(res.error);
                return;
            }
            this.result = res.result;
            this.msg.success('转化成功');
        });
    }
}
