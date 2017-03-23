import {inject, TestBed} from '@angular/core/testing';

import {Message} from './message';
import {User} from './user';

describe('User', () => {
  beforeEach(() => { TestBed.configureTestingModule({providers : [ User ]}); });

  it('user initial values should be correct', inject([ User ], (user: User) => {
       expect(user).toBeTruthy();

       expect(user.privileges.admin).toBeFalsy();
       expect(user.privileges.influence).toBeFalsy();
       expect(user.privileges.owner).toBeFalsy();
       expect(user.privileges.service).toBeFalsy();
       expect(user.privileges.tuner).toBeFalsy();
     }));
  it('update(msg) should correctly set properties',
     inject([ User ], (user: User) => {
       const mockMessage1 =
           new Message('136 Privileges: admin owner service influence tuner');
       const mockMessage2 =
           new Message('136 Privileges: admin service influence');

       user.update(mockMessage1);
       // TODO test all initial properties
       expect(user.privileges.admin).toBeTruthy();
       expect(user.privileges.owner).toBeTruthy();
       expect(user.privileges.service).toBeTruthy();
       expect(user.privileges.influence).toBeTruthy();
       expect(user.privileges.tuner).toBeTruthy();

       user.update(mockMessage2);
       expect(user.privileges.admin).toBeTruthy();
       expect(user.privileges.owner).toBeFalsy();
       expect(user.privileges.service).toBeTruthy();
       expect(user.privileges.influence).toBeTruthy();
       expect(user.privileges.tuner).toBeFalsy();
     }));

});
