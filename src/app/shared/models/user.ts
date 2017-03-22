import {Message} from './message';

export class User {
  private privileges: Privileges;

  constructor() {

    this.privileges = {
      admin : false,
      owner : false,
      service : false,
      influence : false,
      tuner : false
    };
  }

  update(msg: Message) {
    if (msg.code === 136) {
      // msg.content is just a string with all user privileges
      this.privileges.admin = msg.content.includes('admin');
      this.privileges.owner = msg.content.includes('owner');
      this.privileges.service = msg.content.includes('service');
      this.privileges.influence = msg.content.includes('influence');
      this.privileges.tuner = msg.content.includes('tuner');
    }
  }
}

export interface Privileges {
  admin: boolean;
  owner: boolean;
  service: boolean;
  influence: boolean;
  tuner: boolean;
}
