import {Injectable} from '@angular/core';

@Injectable()
export class LocalStorageService {
  public storedConnections: Array<Connection>;
  constructor() {
    const storedConnections = this.get('storedConnections');
    if (!storedConnections) {
      this.save('storedConnections', []);
      this.storedConnections = [];
    } else {
      this.storedConnections = storedConnections;
    }
  }

  public saveConnection(host: string, port: number) {
    if (!this.connectionExists({host : host, port : port})) {
      const storedConnections = this.get('storedConnections');
      storedConnections.push({host : host, port : port, isDefault : false});
      this.save('storedConnections', storedConnections);
      this.storedConnections = storedConnections;
    }
  }

  public deleteSavedConnection(connection: Connection) {
    this.storedConnections = this.storedConnections.filter(
        x => x.port !== connection.port || x.host !== connection.host);
    this.save('storedConnections', this.storedConnections);
  }

  public toggleDefaultConnection(connection: Connection) {
    this.storedConnections = this.storedConnections.map(x => {
      if (x.port === connection.port && x.host === connection.host) {
        x.isDefault = !x.isDefault;
      } else {
        x.isDefault = false;
      }
      return x;
    });
    this.save('storedConnections', this.storedConnections);
  }

  public getStoredConnections() { return this.storedConnections; }

  public setDefaultUser(connection: Connection, defaultUser: LoginInfo) {
    if (this.connectionExists(connection)) {
      this.storedConnections = this.storedConnections.map(cn => {
        if (cn.host === connection.host && cn.port === connection.port) {
          cn.defaultUser = defaultUser;
        }
        return cn;
      });
      this.save('storedConnections', this.storedConnections);
    }
  }

  public removeDefaultUser(connection: Connection) {
    if (this.connectionExists(connection)) {
      this.storedConnections = this.storedConnections.map(cn => {
        if (cn.host === connection.host && cn.port === connection.port) {
          delete cn.defaultUser;
        }
        return cn;
      });
      this.save('storedConnections', this.storedConnections);
    }
  }
  public getDefaultUser(connection: Connection) {
    return this.storedConnections
        .filter(cn =>
                    cn.port === connection.port && cn.host === connection.host)
        .map(cn => cn.defaultUser)
        .reduce((defaultUser, user) => defaultUser = user);
  }

  private save(name, data) {
    let localData: any = window.localStorage.getItem('Pianod');
    if (localData) {
      localData = JSON.parse(localData);
    } else {
      localData = {};
    }

    localData[name] = data;

    window.localStorage.setItem('Pianod', JSON.stringify(localData));
  }

  private get(name) {
    const data = JSON.parse(window.localStorage.getItem('Pianod'));
    if (!data) {
      return undefined;
    }

    if (name) {
      if (data[name]) {
        return data[name];
      } else {
        return null;
      }
    }
    return data;
  }

  private remove(name) {
    const data = JSON.parse(window.localStorage.getItem('Pianod'));
    window.localStorage.removeItem('Pianod');
    if (data[name]) {
      delete data[name];
    };
    window.localStorage.setItem('Pianod', JSON.stringify(data));
  }

  private connectionExists(connection: Connection) {
    if (this.storedConnections
            .filter(x => x.port === connection.port &&
                         x.host === connection.host)
            .length > 0) {
      return true;
    } else {
      return false;
    }
  }
}

export interface Connection {
  port: number;
  host: string;
  isDefault?: boolean;
  defaultUser?: LoginInfo;
}

export interface LoginInfo {
  username: string;
  password: string;
}
