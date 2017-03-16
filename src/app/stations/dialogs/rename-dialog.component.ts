import {Component, OnInit} from '@angular/core';

import {MdDialogConfig, MdDialogRef} from '@angular/material';
@Component({
  selector : 'app-rename-dialog',
  template : ` <h3 md-dialog-title> Rename {{station}} </h3>
    <md-input-container>
        <input #newName mdInput placeholder="Rename" value="{{station}}">
    </md-input-container>
    <md-dialog-actions>
        <button md-raised-button (click)="dialogRef.close()"> Cancel</button>
        <span class="fill-space"></span>
        <button md-raised-button (click)="dialogRef.close(newName.value)"> Submit </button>
    </md-dialog-actions>`
})

export class RenameDialogComponent implements OnInit {
  config: MdDialogConfig = new MdDialogConfig();
  station: string;

  constructor(public dialogRef: MdDialogRef<RenameDialogComponent>) {}

  ngOnInit() {}
}
