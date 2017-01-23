/* tslint:disable:no-unused-variable */
import 'rxjs/Rx';
// import * from 'rxjs/Rx';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/observable/range';
// import 'rxjs/add/operator/range';
// import 'rxjs/add/operator/toPromise';
// import 'rxjs/add/operator/takeWhile';
// import 'rxjs/add/operator/filter';

import {async, fakeAsync, inject, TestBed} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

import {PianodService} from './pianod.service';

describe('PianodService - Setup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers : [ PianodService ]});
  });

  it('should ...', inject([ PianodService ], (service: PianodService) => {
       expect(service).toBeTruthy();
     }));

  describe('connect()', () => {
    it('connect$ event should eventually be true...',
       async(inject([ PianodService ], (service: PianodService) => {
         // let source = Observable.range(0, 1).subscribeOn(service.connected$);
         const initialConnection = service.connected$.take(1).subscribe(
             (connected) => { expect(connected).toEqual(false); });

         // service.connected should eventually be true
         const testConnection =
             service.connected$.take(2)
                 .skipWhile((connected) => connected === false)
                 .subscribe(
                     (connected) => { expect(connected).toEqual(true); });

         // TODO mock websocket
         service.connect('ws://localhost:4446/pianod');
       })));
  });
});
