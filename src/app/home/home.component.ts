import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {LoginDialogComponent} from '../dialogs';
import {LoginInfo, UserInfo} from '../models';
import {LoginService} from '../services/login.service';
import {PianodService} from '../services/pianod.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.scss'],
  // providers: [LoginService]
})

export class HomeComponent implements OnInit, OnDestroy {
  user: Observable<UserInfo>;
  loginDialogRef: MdDialogRef<LoginDialogComponent>;
  routeLinks: any[];
  activeLinkIndex = 0;

  constructor(
      private pianodService: PianodService, private loginService: LoginService,
      private dialog: MdDialog) {}

  ngOnInit() {
    this.user = this.pianodService.getUser();
    this.loginService.tryAutoLogin();

    this.routeLinks = [
      {label: 'Now Playing', link: 'NowPlaying'}, {label: 'Stations', link: 'Stations'},
      {label: 'Search', link: 'Search'}
    ];
  }
  ngOnDestroy() {}

  disconnect() {
    this.pianodService.disconnect();
  }

  login() {
    this.loginDialogRef = this.dialog.open(LoginDialogComponent, {disableClose: false});

    this.loginDialogRef.afterClosed().subscribe((loginInput: LoginInfo) => {
      if (loginInput.username && loginInput.password) {
        this.pianodService.login(loginInput.username, loginInput.password);
      }
      this.loginDialogRef = null;
    });
  }

  logout() {
    this.pianodService.logout();
  }
}
