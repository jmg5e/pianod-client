import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LoginDialogComponent} from '../shared/dialogs';
import {LocalStorageService, LoginInfo} from '../shared/local-storage.service';
import {UserInfo} from '../shared/models';
import {PianodService} from '../shared/pianod.service';

@Component({selector : 'app-login', templateUrl : './login.component.html'})

export class LoginComponent implements OnInit {
  dialogRef: MdDialogRef<LoginDialogComponent>;
  loginInfo: LoginInfo;
  @Input() user: UserInfo;

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              public dialog: MdDialog) {}

  ngOnInit() {}

  openDialog() {
    this.dialogRef =
        this.dialog.open(LoginDialogComponent, {disableClose : false});

    this.dialogRef.afterClosed().subscribe((loginInput: LoginInfo) => {
      if (loginInput) {
        this.loginInfo = loginInput;
        this.login(loginInput);
      }
      this.dialogRef = null;
    });
  }

  // TODO validate input
  login(loginInfo) {
    this.pianodService.login(loginInfo.username, loginInfo.password);
  }

  logout() { this.pianodService.logout(); }
}
