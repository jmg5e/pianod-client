import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {Observable} from 'rxjs/Rx';

import {LoginComponent} from './login/login.component';
// import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LocalStorageService} from './shared/local-storage.service';
import {User} from './shared/models/user';
import {PianodService} from './shared/pianod.service';

@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  // changeDetection : ChangeDetectionStrategy.OnPush
})

export class AppComponent implements OnInit, OnDestroy {
  error;
  connected: Observable<boolean>;
  playback: Observable<any>;
  song: Observable<any>;
  user: Observable<any>;

  barConfig = new MdSnackBarConfig();
  // SWIPE_ACTION = {LEFT : 'swipeleft', RIGHT : 'swiperight'};
  // selectedTab: number = 0;

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              private snackBar: MdSnackBar) {
    this.barConfig.duration = 3000;
  }

  ngOnInit() {
    this.error = this.pianodService.getErrors().subscribe(
        err => this.showSnackBarMsg(err));

    this.user = this.pianodService.getUser();

    this.connected = this.pianodService.getConnectionState();
  }

  ngOnDestroy() {
    if (this.error) {
      this.error.unsubscribe();
    }
  }

  disconnect() { this.pianodService.disconnect(); }

  showSnackBarMsg(msg: string) { this.snackBar.open(msg, '', this.barConfig); }
}
