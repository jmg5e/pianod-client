import {Injectable} from '@angular/core';
import {Connection, LoginInfo} from '../models';

require('nativescript-localstorage');

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
    if (!this.connectionExists({host: host, port: port})) {
      const storedConnections = this.get('storedConnections');
      storedConnections.push({host: host, port: port, isDefault: false});
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

  public getConnection(host: string, port: number) {
    const conn = this.storedConnections.find((x: Connection) => {
    // NOTE: number is converted to string when getting data from storage
      return x.host === host && x.port == port;
    });
    return conn;
  }

  public getStoredConnections() {
    return this.storedConnections;
  }

  public getDefaultConnection() {
    return this.storedConnections.find(conn => conn.isDefault);
  }

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
        .filter(cn => cn.port === connection.port && cn.host === connection.host)
        .map(cn => cn.defaultUser)
        .reduce((defaultUser, user) => defaultUser = user);
  }

  public clearData() {
    localStorage.clear();
    this.save('storedConnections', []);
    this.storedConnections = [];
  }

  private save(name, data) {
    let localData: any = localStorage.getItem('Pianod');
    if (localData) {
      localData = JSON.parse(localData);
    } else {
      localData = {};
    }

    localData[name] = data;

    localStorage.setItem('Pianod', JSON.stringify(localData));
  }

  private get(name) {
    const data = JSON.parse(localStorage.getItem('Pianod'));
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
    const data = JSON.parse(localStorage.getItem('Pianod'));
    localStorage.removeItem('Pianod');
    if (data[name]) {
      delete data[name];
    };

    localStorage.setItem('Pianod', JSON.stringify(data));
  }

  private connectionExists(connection: Connection) {
    if (this.storedConnections.filter(x => x.port === connection.port && x.host === connection.host)
            .length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
