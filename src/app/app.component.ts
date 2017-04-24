import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {LoginComponent} from './login/login.component';
import {ConnectService, LoginService} from './services';

import {LocalStorageService} from './shared/local-storage.service';
import {UserInfo} from './shared/models/user';
import {PianodService} from './shared/pianod.service';

@Component({
  // changeDetection : ChangeDetectionStrategy.OnPush,
  selector : 'app-root',
  templateUrl : './app.component.html',
  providers : [ LoginService, ConnectService ],
})

export class AppComponent implements OnInit, OnDestroy {
  error;
  connected = false;
  user: UserInfo;
  barConfig = new MdSnackBarConfig();

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              private snackBar: MdSnackBar,
              private connectService: ConnectService,
              private loginService: LoginService) {

    this.barConfig.duration = 2000;
  }

  ngOnInit() {
    this.error = this.pianodService.getErrors().subscribe(
        err => this.showSnackBarMsg(err));

    this.pianodService.getUser().subscribe(user => { this.user = user; });

    this.pianodService.getConnectionState().subscribe(connectedState => {

      // lost connection
      if (this.connected && connectedState === false) {
        this.showSnackBarMsg('Disconnected from pianod socket.');
      }
      this.connected = connectedState;
    });
  }

  ngOnDestroy() {
    // is this really necessary?
    if (this.error) {
      this.error.unsubscribe();
    }
  }

  disconnect() { this.pianodService.disconnect(); }

  showSnackBarMsg(msg: string) { this.snackBar.open(msg, '', this.barConfig); }
}
