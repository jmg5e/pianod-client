import {Message} from './message';

export class User {
  private privileges: Privileges;
  public name : string;

  constructor() {
    this.privileges = {
      admin : false,
      owner : false,
      service : false,
      influence : false,
      tuner : false
    };
  }

  getUserInfo(): UserInfo {
    return {name : this.name, privileges : this.privileges};
  }

  getPrivileges(): Privileges { return this.privileges; }

  setPrivileges(msg: Message) {
    if (msg.code === 136) {
      // msg.content is just a string with all user privileges
      Object.assign(this, {
        privileges : {
          admin : msg.content.includes('admin'),
          owner : msg.content.includes('owner'),
          service : msg.content.includes('service'),
          influence : msg.content.includes('influence'),
          tuner : msg.content.includes('tuner')
        }
      });
    }

    return this.getUserInfo();
  }
}

export interface Privileges {
  admin: boolean;
  owner: boolean;
  service: boolean;
  influence: boolean;
  tuner: boolean;
}

export interface UserInfo {
  name: string;
  privileges: Privileges;
}
