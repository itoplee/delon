import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/platform-browser';
import { LazyService } from './lazy.service';

let isIE = false;
let testStatus = 'ok';
class MockDocument {
    getElementsByTagName = () => {
        return [
            {
                appendChild: (node) => {
                    if (node.testStatus === 'ok') {
                        if (node.readyState) {
                            node.readyState = 'complete';
                            node.onreadystatechange();
                        } else {
                            node.onload();
                        }
                        return;
                    }
                    node.onerror();
                }
            }
        ];
    }
    createElement = () => {
        const ret: any = {
            testStatus,
            onload: () => {}
        };
        if (isIE) ret.readyState = 'loading';
        return ret;
    }
}

describe('utils: lazy', () => {
    let srv: LazyService;
    let doc: Document;
    beforeEach(() => {
        isIE = false;
        testStatus = 'ok';
        const injector = TestBed.configureTestingModule({
            providers: [
                LazyService,
                { provide: DOCUMENT, useClass: MockDocument }
            ]
        });
        srv = injector.get(LazyService);
        srv.clear();
        doc = injector.get(DOCUMENT);
    });

    it('should be load a js resource', () => {
        srv.change.subscribe(res => {
            expect(res[0].status).toBe('ok');
        });
        srv.load('/1.js');
    });

    it('should be load a js resource in ie', () => {
        isIE = true;
        srv.change.subscribe(res => {
            expect(res[0].status).toBe('ok');
        });
        srv.load('/1.js');
    });

    it('should be load a css resource', () => {
        srv.change.subscribe(res => {
            expect(res[0].status).toBe('ok');
        });
        srv.load('/1.css');
    });

    it('should be immediately when loaded a js resource', () => {
        let count = 0;
        spyOn(doc, 'createElement').and.callFake(() => ++count);
        srv.load('/2.js');
        expect(count).toBe(1);
        srv.load('/2.js');
        expect(count).toBe(1);
    });

    it('should be immediately when loaded a css resource', () => {
        let count = 0;
        spyOn(doc, 'createElement').and.callFake(() => ++count);
        srv.load('/2.css');
        expect(count).toBe(1);
        srv.load('/2.css');
        expect(count).toBe(1);
    });

    it('should be bad resource', () => {
        testStatus = 'bad';
        srv.change.subscribe(res => {
            expect(res[0].status).toBe('error');
        });
        srv.load('/3.js');
    });
});