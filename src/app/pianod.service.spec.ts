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
  let testService;
  beforeEach(() => {
    TestBed.configureTestingModule({providers : [ PianodService ]});
  });

  it('should ...', inject([ PianodService ], (service: PianodService) => {
       expect(service).toBeTruthy();
       testService = service;
     }));

  describe('connect()', () => {
    it('connect$ event should eventually be true...', (done) => {
      // console.log(testService);

      testService.connected$.take(2)
          .skipWhile((connected) => connected === false)
          .subscribe((connected) => {
            expect(connected).toEqual(true);
            done();
          });
      testService.connect('ws://localhost:4446/pianod');
    });
  });

  describe('login()', () => {

                      });
});
