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
        'isDefault' : true
      } ]
    };
    window.localStorage.setItem('Pianod', JSON.stringify(storage));

    TestBed.configureTestingModule(
        {providers : [ PianodService, LocalStorageService, ConnectService ]});
  });

  beforeEach(inject(
      [ PianodService, ConnectService ],
      (s: PianodService, c: ConnectService) => { this.pianodService = s; }));

  it('connect service should automatically connect to mock pianod socket with defaultConnection',
     (done) => {
       this.pianodService.getConnectionState().take(2).toArray().subscribe(
           connected => {
             expect(connected).toEqual([ false, true ]);
             expect(this.pianodService.connectionInfo).toEqual(mockPianod);
             done();
           });
     });
});
