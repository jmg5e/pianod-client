import {Message} from './message';
interface Privileges {
  admin: boolean;
  owner: boolean;
  service: boolean;
  influence: boolean;
  tuner: boolean;
}

export class User {
  name: string;
  loggedIn: boolean = false;
  // privileges : <any>;
  // password: string; //needed to automatically reconnect
  // pianod can handle  encrypted passwords i think

  privileges: any;

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
      this.loggedIn = true;
      // let credentials = Message.getData(msg.content);
      // msg.content is just a string with all user privileges
      let credentials = msg.content;
      this.privileges.admin = credentials.includes('admin');
      this.privileges.owner = credentials.includes('owner');
      this.privileges.service = credentials.includes('service');
      this.privileges.influence = credentials.includes('influence');
      this.privileges.tuner = credentials.includes('tuner');
    }
  }
}
