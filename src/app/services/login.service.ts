import {Injectable} from '@angular/core';

import {LocalStorageService, LoginInfo} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';

@Injectable()
export class LoginService {

  connected = false;
  constructor(private localStorageService: LocalStorageService,
              private pianodService: PianodService) {

    this.pianodService.getConnectionState().subscribe(connected => {
      if (!this.connected && connected) {
        const defaultUser = this.getDefaultUser();
        if (defaultUser) {
          this.pianodService.login(defaultUser.username, defaultUser.password);
        }
      }
      this.connected = connected;
    });
  }

  private getDefaultUser() {
    const currentConnection =
        this.localStorageService.getStoredConnections().find(
            cn => cn.host === this.pianodService.connectionInfo.host &&
                  cn.port === this.pianodService.connectionInfo.port);
    if (!currentConnection ||
        !currentConnection.hasOwnProperty('defaultUser')) {
      return null;
    } else {
      return currentConnection.defaultUser;
    }
  }
}
