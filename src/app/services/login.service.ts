import {Injectable} from '@angular/core';

import {LoginInfo} from '../models';
import {LocalStorageService, PianodService} from '../services';

@Injectable()
export class LoginService {
  constructor(
      private localStorageService: LocalStorageService, private pianodService: PianodService) {}

  // login with saved default user if exists
  public tryAutoLogin() {
    const defaultUser = this.getDefaultUser();
    if (defaultUser) {
      this.pianodService.login(defaultUser.username, defaultUser.password);
    }
  }

  private getDefaultUser(): LoginInfo {
    const currentConnection = this.localStorageService.getStoredConnections().find(
        cn => cn.host === this.pianodService.connectionInfo.host &&
            cn.port === this.pianodService.connectionInfo.port);
    if (!currentConnection || !currentConnection.hasOwnProperty('defaultUser')) {
      return null;
    } else {
      return currentConnection.defaultUser;
    }
  }
}
