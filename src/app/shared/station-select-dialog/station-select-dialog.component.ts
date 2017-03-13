import {Component, OnInit} from '@angular/core';

import {MdDialogConfig, MdDialogRef} from '@angular/material';
@Component({
  selector : 'app-station-select-dialog',
  template : `
    <md-list *ngFor="let station of stationList">
        <md-list-item (click)="dialogRef.close(station)" class="station-item">{{station}}</md-list-item>
    </md-list>`,
  styleUrls : [ './station-select-dialog.component.scss' ]
})

export class StationSelectDialogComponent implements OnInit {

  config: MdDialogConfig = new MdDialogConfig();
  stationList: Array<string>;

  constructor(public dialogRef: MdDialogRef<StationSelectDialogComponent>) {}

  ngOnInit() {}
}
