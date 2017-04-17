import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {LoginDialogComponent} from '../shared/dialogs/login-dialog.component';
import {LocalStorageService, LoginInfo} from '../shared/local-storage.service';
import {User} from '../shared/models/user';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-login',
  templateUrl : './login.component.html',
  // changeDetection : ChangeDetectionStrategy.OnPush
})

export class LoginComponent implements OnInit {
  dialogRef: MdDialogRef<LoginDialogComponent>;
  loginInfo: LoginInfo;
  @Input() user: User;
  user$;
  connected = false;

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              public dialog: MdDialog) {}

  ngOnInit() {
    this.user$ = this.pianodService.getUser();
    this.pianodService.getConnectionState().subscribe((connected) => {
      // if connected for first time
      if (connected && !this.connected) {
        const defaultUser = this.getDefaultUser();
        // auto login
        if (defaultUser) {
          this.login(defaultUser);
        }
      }
      this.connected = connected;
    });
  }

  private getDefaultUser() {
    const connectionInfo = this.pianodService.connectionInfo;
    return this.localStorageService.getDefaultUser(connectionInfo);
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

  login(loginData) {
    this.pianodService.sendCmd(
        `user ${loginData.username} ${loginData.password}`);
  }

  logout() { this.pianodService.logout(); }
}
