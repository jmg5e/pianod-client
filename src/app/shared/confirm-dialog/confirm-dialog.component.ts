import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

@Component({
  selector : 'app-confirm-dialog',
  template : `<h1 md-dialog-title>{{title}}?</h1>
    <md-dialog-actions style="display: flex; justify-content:space-around">
        <button type="button" md-raised-button color="warn" (click)="dialogRef.close()">cancel</button>
        <button type="button" md-raised-button color="primary" (click)="dialogRef.close(true)">yes</button>
    </md-dialog-actions>`
})

export class ConfirmDialogComponent implements OnInit {
  config: MdDialogConfig = new MdDialogConfig();
  title: string;

  constructor(public dialogRef: MdDialogRef<ConfirmDialogComponent>) {}

  ngOnInit() {}
}
