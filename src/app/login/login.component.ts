import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LocalStorageService} from '../shared/local-storage.service';
import {User} from '../shared/models/user';
import {PianodService} from '../shared/pianod.service';

import {LoginDialogComponent} from './login-dialog/login-dialog.component';

@Component({
  selector : 'app-login',
  templateUrl : './login.component.html'
  // styleUrls : [ './login.component.scss' ]
})

export class LoginComponent implements OnInit {
  dialogRef: MdDialogRef<LoginDialogComponent>;
  loginInfo: LoginInfo;
  user: User = new User();
  connected = false;
  // @Output() userLogin = new EventEmitter<User>();

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.connected$.subscribe((connected) => {
      // need to know if connected!
      if (connected && !this.connected) {
        this.loginInfo = this.localStorageService.get('userLogin');
        if (this.loginInfo) {
          // console.log('auto login');
          this.login(this.loginInfo);
        }
      }
      this.connected = connected;
    });

    this.pianodService.user$.subscribe((user: User) => {
      this.user = user;
      if (user.loggedIn) {
        // TODO : passsword is stored in plain text in browser storage!
        // logInfo could potential be modified before event, potentially saving
        // incorrect login credientials
        this.localStorageService.save('userLogin', this.loginInfo);
      }
    });
  }

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

  login(loginData: LoginInfo) {
    this.pianodService.sendCmd(
        `user ${loginData.username} ${loginData.password}`);
  }

  logout() {
    this.localStorageService.remove('userLogin');
    this.pianodService.logout();
    // this.userLogin.emit(new User());
  }
}

interface LoginInfo {
  username: string;
  password: string;
}
