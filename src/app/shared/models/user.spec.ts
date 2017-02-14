import {async, fakeAsync, inject, TestBed} from '@angular/core/testing';

import {Message} from './message';
import {User} from './user';

describe('User', () => {
  beforeEach(() => { TestBed.configureTestingModule({providers : [ User ]}); });

  it('user initial values should be correct', inject([ User ], (user: User) => {
       expect(user).toBeTruthy();
       // TODO test all initial properties
       expect(user.loggedIn).toBeFalsy();
     }));
  it('update(msg) should correctly set properties',
     inject([ User ], (user: User) => {
       const mockMessage1 =
           new Message('136 Privileges: admin owner service influence tuner');
       const mockMessage2 =
           new Message('136 Privileges: admin owner service influence');

       user.update(mockMessage1);
       expect(user.loggedIn).toBeTruthy();
       // TODO test all initial properties
       expect(user.privileges.admin).toBeTruthy();

       user.update(mockMessage2);
       expect(user.privileges.tuner).toBeFalsy();
     }));

});
