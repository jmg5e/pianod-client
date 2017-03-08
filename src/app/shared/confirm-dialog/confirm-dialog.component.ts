import {Component, OnInit} from '@angular/core';

// import {FormBuilder, FormControl, FormGroup, Validators} from
// '@angular/forms';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

// import {LoginComponent} from '../login.component';
@Component({
  selector : 'app-confirm-dialog',
  templateUrl : './confirm-dialog.component.html'
  // styleUrls : [ './login-dialog.component.scss' ]
})

@Component({
  selector : 'app-confirm-dialog',
  templateUrl : './confirm-dialog.component.html',
  styleUrls : [ './confirm-dialog.component.scss' ]
})

export class ConfirmDialogComponent implements OnInit {
  config: MdDialogConfig = new MdDialogConfig();
  station: string;

  constructor(public dialogRef: MdDialogRef<ConfirmDialogComponent>) {}

  ngOnInit() {}
}
