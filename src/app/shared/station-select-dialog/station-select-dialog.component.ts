import {Component, OnInit} from '@angular/core';

import {MdDialogConfig, MdDialogRef} from '@angular/material';
@Component({
  selector : 'app-station-select-dialog',
  template : `
    <h2 md-dialog-title> {{dialogTitle}} </h2>
    <md-list *ngFor="let station of stationList">
        <md-list-item >
            <button md-raised-button color="primary" style="width:100%" (click)="dialogRef.close(station)">{{station}}</button>
        </md-list-item>
    </md-list>`,
  styleUrls : [ './station-select-dialog.component.scss' ]
})

export class StationSelectDialogComponent implements OnInit {

  config: MdDialogConfig = new MdDialogConfig();
  stationList: Array<string>;
  dialogTitle: string;
  constructor (public dialogRef: MdDialogRef<StationSelectDialogComponent>) {}

  ngOnInit() {}
}
