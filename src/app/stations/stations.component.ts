import {Component, Input, OnInit} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {PianodService} from '../pianod.service';
import {User} from '../user';

import {
  ConfirmDialogComponent
} from './confirm-dialog/confirm-dialog.component';

@Component({
  selector : 'app-stations',
  templateUrl : './stations.component.html',
  styleUrls : [ './stations.component.scss' ]
})

export class StationsComponent implements OnInit {
  confirmDialogRef: MdDialogRef<ConfirmDialogComponent>;

  @Input() currentStation;
  stations = [];
  mixList: Array<string> = [];

  constructor(private pianodService: PianodService, public dialog: MdDialog) {
    // this.pianodService.currentStation$.subscribe(
    //     currentStation => this.currentStation = currentStation);
  }

  ngOnInit() {
    this.pianodService.stations$.subscribe((stations) => {
      // console.log('got stations');
      this.stations = stations;
    });

    this.pianodService.mixList$.subscribe((mixList) => {
      this.mixList =
          mixList.map(station => station.Name.replace('Station', '').trim());
    });
  }

  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }

  inMix(stationName) { return (this.mixList.indexOf(stationName) !== -1); }

  toggleInMix(stationName) {
    this.pianodService.sendCmd(`MIX TOGGLE \"${stationName}\"`);
  }

  deleteStation(stationName) {
    this.pianodService.sendCmd(`DELETE STATION \"${stationName}\"`);
  }

  deleteSeed(seedId) {
    // console.log('deleting seed');
    this.pianodService.sendCmd(`DELETE SEED ${seedId}`).then((res) => {
      console.log(res);
    });
  }

  renameStation(stationName, newName) {
    this.pianodService.sendCmd(
        `RENAME STATION \"${stationName}\" TO \"${newName}\"`);
  }

  openConfirmDialog(stationName) {
    this.confirmDialogRef =
        this.dialog.open(ConfirmDialogComponent, {disableClose : true});

    this.confirmDialogRef.componentInstance.station = stationName;
    this.confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.deleteStation(stationName);
      }
      this.confirmDialogRef = null;
    });
  }
}
