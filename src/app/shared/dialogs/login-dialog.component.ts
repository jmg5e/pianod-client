import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

@Component({
  selector : 'app-login-dialog',
  templateUrl : './login-dialog.component.html'
})

export class LoginDialogComponent implements OnInit {

  loginForm;
  config: MdDialogConfig = new MdDialogConfig();

  constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username : new FormControl(null, Validators.required),
      password : new FormControl(null, Validators.required)
    });
  }

  submitForm(form: any) {
    this.dialogRef.close(
        {username : form.username.trim(), password : form.password});
  }

  close() { this.dialogRef.close(false); }
}
