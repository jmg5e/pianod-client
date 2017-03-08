import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

// import {LoginComponent} from '../login.component';
@Component({
  selector : 'app-login-dialog',
  templateUrl : './login-dialog.component.html'
  // styleUrls : [ './login-dialog.component.scss' ]
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
  }

  ngOnInit() {}

  submitForm(form: any) {
    this.dialogRef.close(
        {username : form.username.trim(), password : form.password});
  }

  close() { this.dialogRef.close(false); }
}
