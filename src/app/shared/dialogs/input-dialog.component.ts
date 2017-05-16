import {Component, OnInit} from '@angular/core';

import {MdDialogConfig, MdDialogRef} from '@angular/material';
@Component({
  selector : 'app-input-dialog',
  template : ` <h3 md-dialog-title> {{title}} </h3>
    <md-input-container (keyUp.enter)="dialogRef.close(newName.value)">
        <input #newName mdInput value="{{inputValue}}">
    </md-input-container>
    <md-dialog-actions>
        <button md-raised-button (click)="dialogRef.close()"> Cancel</button>
        <span class="fill-space"></span>
        <button md-raised-button (click)="dialogRef.close(newName.value)"> Submit </button>
    </md-dialog-actions>`
})

export class InputDialogComponent implements OnInit {
  config: MdDialogConfig = new MdDialogConfig();
  inputValue: string;
  title: string;

  constructor(public dialogRef: MdDialogRef<InputDialogComponent>) {}

  ngOnInit() {}
}
