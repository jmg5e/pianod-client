import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {
  ConfirmDialogComponent
} from '../shared/confirm-dialog/confirm-dialog.component';
import {User} from '../shared/models/user';
import {PianodService} from '../shared/pianod.service';
import {
  StationSelectDialogComponent
} from '../shared/station-select-dialog/station-select-dialog.component';

import {ManageSeedsComponent} from './dialogs/manage-seeds.component';
import {RenameDialogComponent} from './dialogs/rename-dialog.component';

@Component({
  selector : 'app-stations',
  templateUrl : './stations.component.html',
  styleUrls : [ './stations.component.scss' ]
})

export class StationsComponent implements OnInit {
  confirmDialogRef: MdDialogRef<ConfirmDialogComponent>;
  selectStationDialogRef: MdDialogRef<StationSelectDialogComponent>;
  renameDialogRef: MdDialogRef<RenameDialogComponent>;
  manageSeedsRef: MdDialogRef<ManageSeedsComponent>;
  currentStation: string;
  // stations = [];
  stationList: Array<string> = [];
  mixList: Array<string> = [];
  @Output() stationsModified = new EventEmitter();

  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.getStations().subscribe(
        stationList => { this.stationList = stationList; });

    this.pianodService.getMixList().subscribe((mixList) => this.mixList =
                                                  mixList);

    this.pianodService.getCurrentStation().subscribe(
        currentStation => this.currentStation = currentStation);
  }
  playMix() { this.pianodService.sendCmd('PLAY MIX'); }

  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }
  inMix(stationName) { return (this.mixList.indexOf(stationName) !== -1); }
  isPlaying(stationName) {
    if (this.inMix(stationName) && this.currentStation === 'mix QuickMix') {
      return true;
    } else if (stationName === this.currentStation) {
      return true;
    } else {
      return false;
    }
  }

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

  // deleteSeed(seedId) {
  //   this.pianodService.sendCmd(`DELETE SEED ${seedId}`).then(res => {
  //     if (!res.error) {
  //       this.stations = this.stations.map(station => {
  //         station.Seeds = station.Seeds.filter(seed => seed.ID !== seedId);
  //         return station;
  //       });
  //       this.stationsModified.emit(
  //           'Seed was successfully deleted from station.');
  //     }
  //   });
  // }

  openManageSeeds(stationName) {
    this.manageSeedsRef =
        this.dialog.open(ManageSeedsComponent, {disableClose : false});
    this.manageSeedsRef.componentInstance.station = stationName;
    this.manageSeedsRef.afterClosed().subscribe(
        results => { this.manageSeedsRef = null; });
  }

  openRenameDialog(stationName) {
    this.renameDialogRef =
        this.dialog.open(RenameDialogComponent, {disableClose : true});
    this.renameDialogRef.componentInstance.station = stationName;
    this.renameDialogRef.afterClosed().subscribe((newName: string) => {
      if (newName) {
        // console.log(newName);
        this.renameStation(stationName, newName);
      }
      this.renameDialogRef = null;
    });
  }
  renameStation(stationName, newName) {
    this.pianodService.sendCmd(
        `RENAME STATION \"${stationName}\" TO \"${newName}\"`);
  }

  openConfirmDialog(stationName) {
    this.confirmDialogRef =
        this.dialog.open(ConfirmDialogComponent, {disableClose : true});

    this.confirmDialogRef.componentInstance.title =
        `Are your sure you want to delete station ${stationName}?`;
    this.confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.deleteStation(stationName);
      }
      this.confirmDialogRef = null;
    });
  }

  selectStation() {
    this.selectStationDialogRef =
        this.dialog.open(StationSelectDialogComponent);
    this.selectStationDialogRef.componentInstance.stationList =
        this.stationList;
    this.selectStationDialogRef.componentInstance.dialogTitle = 'Play Station';
    this.selectStationDialogRef.afterClosed().subscribe(
        (selectedStation: string) => {
          if (selectedStation) {
            this.playStation(selectedStation);
          }
          this.selectStationDialogRef = null;
        });
  }
}
