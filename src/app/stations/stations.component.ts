import {Component, EventEmitter, OnInit, Output} from '@angular/core';
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

  currentStation: string;
  stations = [];
  mixList: Array<string> = [];
  @Output() stationsModified = new EventEmitter();

  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.user$.subscribe((user) => {
      if (user.loggedIn) {
        this.pianodService.updateStations();
      }
    });

    this.pianodService.stations$.subscribe(
        (stations) => { this.stations = stations; });

    this.pianodService.mixList$.subscribe((mixList) => {
      this.mixList =
          mixList.map(station => station.Name.replace('Station', '').trim());
    });

    this.pianodService.currentStation$.subscribe(
        currentStation => this.currentStation = currentStation);
  }

  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }

  inMix(stationName) { return (this.mixList.indexOf(stationName) !== -1); }

  toggleInMix(stationName) {
    this.pianodService.sendCmd(`MIX TOGGLE \"${stationName}\"`);
  }

  deleteStation(stationName) {
    this.pianodService.sendCmd(`DELETE STATION \"${stationName}\"`)
        .then(res => {
          if (!res.error) {
            this.stationsModified.emit('Station ' + stationName +
                                       ' was successfully deleted.');
          }
        });
  }

  deleteSeed(seedId) {
    this.pianodService.sendCmd(`DELETE SEED ${seedId}`).then((res) => {
      if (!res.error) {
        // this.pianodService.updateStations();
        this.stations = this.stations.map(station => {
          station.Seeds = station.Seeds.filter(seed => seed.ID !== seedId);
          return station;
        });
        this.stationsModified.emit(
            'Seed was successfully deleted from station.');
      }
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
