import {async, inject, TestBed} from '@angular/core/testing';

import {LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';

import {ConnectService} from './connect.service';
import {LoginService} from './login.service';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
const mockPianod = {
  host : 'localhost',
  port : 4201
};

describe('LoginService', () => {
  beforeEach(() => {
    // mock local storage service?
    const storage = {
      'storedConnections' : [ {
        'host' : mockPianod.host,
        'port' : mockPianod.port,
        'auto_connect' : true,
        'defaultUser' : {'username' : 'userName', 'password' : 'validPass'}
      } ]
    };
    window.localStorage.setItem('Pianod', JSON.stringify(storage));

    TestBed.configureTestingModule(
        {providers : [ PianodService, LocalStorageService, LoginService ]});
  });

  beforeEach((inject([ PianodService, LocalStorageService, LoginService ],
                     (pianodService: PianodService,
                      localStorageService: LocalStorageService) => {
                       this.pianodService = pianodService;
                       // provide instance of connect service
                       // is really testing to see if ConnectService auto
                       // connects as well
                       // this.connectService = new ConnectService();
                       // pianodService, localStorageService);
                       // this.pianodService
                       //     .connect(mockPianod.host, mockPianod.port)
                       //     .then(res => console.log(res));
                     })));

  it('login service should automatically login with default user when connected to mock pianod socket',
     (done) => {
       // adheres to pianod protocol : gets initial user with no previliges,
       // gets user on connect, gets user on login
       this.pianodService.getUser().skip(2).subscribe(user => {
         // console.log(user);
         expect(user.name).toEqual('userName');
         done();
       });

       // this.pianodService.getConnectionState().subscribe(con =>
       //                                                       console.log(con));
     });
});
