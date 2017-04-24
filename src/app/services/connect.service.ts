import {Injectable} from '@angular/core';

import {Connection, LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';

@Injectable()
export class ConnectService {

  savedAutoConnection;
  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService) {

    this.savedAutoConnection = this.getAutoConnection();
    if (this.savedAutoConnection) {
      this.connect(this.savedAutoConnection);
    }
  }

  private getAutoConnection() {
    const storedConnections = this.localStorageService.getStoredConnections();
    return storedConnections.find(conn => conn.auto_connect);
  }

  private connect(connectionInfo: Connection) {
    this.pianodService.connect(connectionInfo.host, connectionInfo.port);
  }
}
