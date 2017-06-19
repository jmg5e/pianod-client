import {Injectable} from '@angular/core';

import {Connection, LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';

@Injectable()
export class ConnectService {

  defaultConnection;
  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService) {

    this.defaultConnection = this.getDefaultConnection();
    if (this.defaultConnection) {
      this.connect(this.defaultConnection);
    }
  }

  private getDefaultConnection() {
    const storedConnections = this.localStorageService.getStoredConnections();
    return storedConnections.find(conn => conn.isDefault);
  }

  private connect(connectionInfo: Connection) {
    this.pianodService.connect(connectionInfo.host, connectionInfo.port);
  }
}
