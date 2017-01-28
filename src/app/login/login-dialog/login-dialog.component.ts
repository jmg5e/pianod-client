import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';
// import {LoginComponent} from '../login.component';
@Component({
  selector : 'app-login-dialog',
  templateUrl : './login-dialog.component.html',
  styleUrls : [ './login-dialog.component.scss' ]
})
export class LoginDialogComponent implements OnInit {

  username: string;
  password: string;
  config: MdDialogConfig = new MdDialogConfig();
  constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) {
    // this.config.disableClose = true;
    // config.viewContainerRef = LoginComponent;
  }

  ngOnInit() {}
  onSubmit(e: any) {

    // e.preventDefault();
    // console.log(this.username, this.password);
    this.dialogRef.close({username : this.username, password : this.password});
  }
}
