import {Injectable} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';

import {Connection, LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';

@Injectable()
export class ConnectService {

  savedAutoConnection;
  connected = false;
  constructor(private pianodService: PianodService, private router: Router,
              private localStorageService: LocalStorageService) {

    this.savedAutoConnection = this.getAutoConnection();
    if (this.savedAutoConnection) {
      this.connect(this.savedAutoConnection);
    }
    // TODO use router canLoad and canActivate
    this.pianodService.getConnectionState().subscribe(connected => {
      if (!connected) {
        this.router.navigate([ '/Connect' ]);
        }
      if (!this.connected && connected) {
        this.router.navigate([ '/NowPlaying' ]);
      }
      this.connected = connected;
    });
  }

  private getAutoConnection() {
    const storedConnections = this.localStorageService.getStoredConnections();
    return storedConnections.find(conn => conn.auto_connect);
  }

  private connect(connectionInfo: Connection) {
    this.pianodService.connect(connectionInfo.host, connectionInfo.port);
  }
}
