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
  it('update(msg) should correctly correctly update privileges',
      inject([ User ], (user: User) => {
        const mockMessage1 = new Message('136 Privileges: listener');
        const mockMessage2 =
            new Message('136 Privileges: admin service influence');

        user.update(mockMessage1);
        // console.log(user.privileges);
        // TODO test all initial properties
        expect(user.privileges.listener).toBeTruthy();
        expect(user.privileges.admin).toBeFalsy();
        expect(user.privileges.owner).toBeFalsy();
        expect(user.privileges.service).toBeFalsy();
        expect(user.privileges.influence).toBeFalsy();
        expect(user.privileges.tuner).toBeFalsy();

        user.update(mockMessage2);
        expect(user.privileges.listener).toBeTruthy();
        expect(user.privileges.admin).toBeTruthy();
        expect(user.privileges.service).toBeTruthy();
        expect(user.privileges.influence).toBeTruthy();
        expect(user.privileges.owner).toBeFalsy();
        expect(user.privileges.tuner).toBeFalsy();
      }));

});
