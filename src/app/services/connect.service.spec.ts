import {async, inject, TestBed} from '@angular/core/testing';

import {Connection, LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';
import {ConnectService} from './connect.service';

const mockPianod = {
  'port' : 4201,
  'host' : 'localhost'
};

describe('ConnectService', () => {
  beforeEach(() => {
    // mock local storage service?
    const storage = {
      'storedConnections' : [ {
        'host' : mockPianod.host,
        'port' : mockPianod.port,
        'auto_connect' : true
      } ]
    };
    window.localStorage.setItem('Pianod', JSON.stringify(storage));

    TestBed.configureTestingModule(
        {providers : [ PianodService, LocalStorageService, ConnectService ]});
  });

  beforeEach(inject(
      [ PianodService, ConnectService ],
      (s: PianodService, c: ConnectService) => { this.pianodService = s; }));

  it('connect service should automatically connect to mock pianod socket',
     (done) => {
       this.pianodService.getConnectionState().take(2).toArray().subscribe(
           connected => {
             expect(connected).toEqual([ false, true ]);
             expect(this.pianodService.connectionInfo).toEqual(mockPianod);
             done();
           });
     });
});
// fdescribe('ConnectService', () => {
//   beforeEach(() => {
//     const storage = {
//       'storedConnections' : [ {
//         'host' : mockPianod.host,
//         'port' : mockPianod.port,
//         'auto_connect' : true
//       } ]
//     };
//     window.localStorage.setItem('Pianod', JSON.stringify(storage));
//     const localStorage = new LocalStorageService();
//     TestBed.configureTestingModule({
//       providers : [
//         ConnectService,
//         PianodService,
//         {provide : LocalStorageService, useValue : localStorage},
//       ]
//     });
//   });
//   // beforeEach(inject([ ConnectService, PianodService ]),
//   //            (service: PianodService) => { this.service = service; });
//
//   it('should successfully inject service',
//      inject([ ConnectService ],
//             (service: ConnectService) => { expect(service).toBeTruthy(); }));
//
//   // mock localStorageService?
//   it('should auto connect to pianod socket if a stored connection has default
//   property',
//      async(inject([ ConnectService, PianodService ],
//                   (service: ConnectService, pianodService: PianodService) =>
//                   {
//                     console.log(window.localStorage);
//                     return pianodService.getConnectionState()
//                         .take(2)
//                         .toArray()
//                         .toPromise()
//                         .then(connected => {
//                           expect(connected).toEqual([ false, true ]);
//                           console.log(connected);
//                         });
//                     // expect(false).toBeTruthy();
//                   })));
// });
