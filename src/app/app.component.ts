import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {ConnectService} from './services/connect.service';
// import {LocalStorageService, PianodService, ConnectService} from './services';
import {LocalStorageService} from './services/local-storage.service';
import {LoginService} from './services/login.service';
import {PianodService} from './services/pianod.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ConnectService, LoginService],
})

export class AppComponent implements OnInit, OnDestroy {
  error;
  barConfig = new MdSnackBarConfig();

  constructor(
      private pianodService: PianodService, private localStorageService: LocalStorageService,
      private snackBar: MdSnackBar) {
    this.barConfig.duration = 2000;
  }

  ngOnInit() {
    this.error = this.pianodService.getErrors().subscribe(err => this.showSnackBarMsg(err));
  }

  ngOnDestroy() {
    // is this really necessary?
    if (this.error) {
      this.error.unsubscribe();
    }
  }

  showSnackBarMsg(msg: string) {
    this.snackBar.open(msg, '', this.barConfig);
  }
}
