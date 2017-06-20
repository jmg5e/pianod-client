import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

@Component({selector: 'app-login-dialog', templateUrl: './login-dialog.component.html'})

export class LoginDialogComponent implements OnInit {
  loginForm: FormGroup;
  config: MdDialogConfig = new MdDialogConfig();
  dialogTitle: string;

  constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });
    this.dialogTitle = this.dialogTitle ? this.dialogTitle : 'Login';
  }

  submitForm(form: any) {
    this.dialogRef.close({username: form.username.trim(), password: form.password});
  }

  close() {
    this.dialogRef.close(false);
  }
}
