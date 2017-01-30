import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

// import {LoginComponent} from '../login.component';
@Component({
  selector : 'app-login-dialog',
  templateUrl : './login-dialog.component.html',
  styleUrls : [ './login-dialog.component.scss' ]
})
export class LoginDialogComponent implements OnInit {

  loginForm;
  username: string;
  password: string;
  config: MdDialogConfig = new MdDialogConfig();
  constructor(public dialogRef: MdDialogRef<LoginDialogComponent>,
              fb: FormBuilder) {
    this.loginForm = fb.group({
      username : [ null, Validators.required ],
      password : [ null, Validators.required ]
    });
    // this.config.disableClose = true;
    // config.viewContainerRef = LoginComponent;
  }

  ngOnInit() {}
  onSubmit(e: any) {

    // e.preventDefault();
    // console.log(this.username, this.password);
    this.dialogRef.close({username : this.username, password : this.password});
  }
  submitForm(form: any) {
    console.log('submitForm');
    console.log(form);
    // this.dialogRef.close();
    this.dialogRef.close({username : form.username, password : form.password});
  }
}
