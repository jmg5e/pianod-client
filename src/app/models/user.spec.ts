import {inject, TestBed} from '@angular/core/testing';

import {Message} from './message';
import {User, UserInfo} from './user';

describe('User', () => {
  beforeEach(() => { TestBed.configureTestingModule({providers : [ User ]}); });

  it('user initial values should be correct', inject([ User ], (user: User) => {
       expect(user).toBeTruthy();
       expect(user.name).toBeUndefined();
       expect(user.getPrivileges().admin).toBeFalsy();
       expect(user.getPrivileges().influence).toBeFalsy();
       expect(user.getPrivileges().owner).toBeFalsy();
       expect(user.getPrivileges().service).toBeFalsy();
       expect(user.getPrivileges().tuner).toBeFalsy();
     }));

  it('setPrivileges(msg) should correctly set privileges',
     inject([ User ], (user: User) => {
       const mockMessage1 =
           new Message('136 Privileges: admin owner service influence tuner');
       const mockMessage2 =
           new Message('136 Privileges: admin service influence');

       user.setPrivileges(mockMessage1);
       expect(user.getPrivileges().admin).toBeTruthy();
       expect(user.getPrivileges().owner).toBeTruthy();
       expect(user.getPrivileges().service).toBeTruthy();
       expect(user.getPrivileges().influence).toBeTruthy();
       expect(user.getPrivileges().tuner).toBeTruthy();

       user.setPrivileges(mockMessage2);
       expect(user.getPrivileges().admin).toBeTruthy();
       expect(user.getPrivileges().owner).toBeFalsy();
       expect(user.getPrivileges().service).toBeTruthy();
       expect(user.getPrivileges().influence).toBeTruthy();
       expect(user.getPrivileges().tuner).toBeFalsy();
     }));

  it('getUserInfo() should return correct user properties',
     inject([ User ], (user: User) => {
       const mockMessage = new Message('136 Privileges: admin owner');

       user.setPrivileges(mockMessage);
       user.name = 'UserName';
       const userInfo = user.getUserInfo();
       expect(userInfo).toEqual({
         'name' : 'UserName',
         privileges : {
           admin : true,
           owner : true,
           service : false,
           influence : false,
           tuner : false
         }
       });
     }));
});
