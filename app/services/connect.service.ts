import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {Connection} from '../models';
import {LocalStorageService} from './local-storage.service';
import {PianodService} from './pianod.service';

@Injectable()
export class ConnectService {
  private connected: boolean;

  // probably more ideal to validate input in component form
  static isValidConnection(host: string, port: number) {
    const validHost =
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
            .test(host);
    const validPort = Number.isInteger(port) && port > 0 && port < 65535;
    return validHost && validPort;
  }

  constructor(
      private pianodService: PianodService, private localStorageService: LocalStorageService,
      private router: Router) {
    this.listenConnectedEvents();

    this.tryAutoConnect();
  }

  // listen for changes in connected state ie, connected/disconnected
  private listenConnectedEvents() {
    this.pianodService.getConnectionState().subscribe(connected => {
      if (this.connected != null) {
        if (!this.connected && connected) {
          this.router.navigate(['/Home']);
          }
        if (this.connected && !connected) {
          this.router.navigate(['/Connect']);
        }

      } else {
        this.router.navigate(['/Connect']);
      }
      this.connected = connected;
    });
  }

  // try to connect if default connection is set
  private tryAutoConnect() {
    const defaultConnection = this.localStorageService.getDefaultConnection();
    if (defaultConnection) {
      this.connect(defaultConnection);
    }
  }

  public connect(connectionInfo: Connection) {
    return this.pianodService.connect(connectionInfo.host, connectionInfo.port);
  }
}
