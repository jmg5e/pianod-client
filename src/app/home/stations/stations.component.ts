import {Component, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {
  ConfirmDialogComponent,
  InputDialogComponent,
} from '../../dialogs';
import {User} from '../../models';
import {PianodService} from '../../services';
import {ManageSeedsComponent} from '../../components/manage-seeds.component';

@Component({
  selector : 'app-stations',
  templateUrl : './stations.component.html',
  styleUrls : [ './stations.component.scss' ]
})

export class StationsComponent implements OnInit {
  confirmDialogRef: MdDialogRef<ConfirmDialogComponent>;
  renameDialogRef: MdDialogRef<InputDialogComponent>;
  manageSeedsRef: MdDialogRef<ManageSeedsComponent>;
  currentStation: string;
  stationList: Observable<Array<string>>;
  mixList: Observable<Array<string>>;

  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.stationList = this.pianodService.getStations();

    this.mixList = this.pianodService.getMixList();

    this.pianodService.getCurrentStation().subscribe(
        currentStation => this.currentStation = currentStation);
  }
  playMix() { this.pianodService.sendCmd('PLAY MIX'); }

  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }

  toggleInMix(stationName) {
    this.pianodService.toggleStationInMix(stationName);
  }

  deleteStation(stationName) {
    this.pianodService.sendCmd(`DELETE STATION \"${stationName}\"`)
        .then(res => {
          if (!res.error) {
            // this.stationsModified.emit('Station ' + stationName +
            //                            ' was successfully deleted.');
          }
        });
  }

  stationIsPlaying(station): Observable<boolean> {
    return this.pianodService.stationIsPlaying(station);
  }

  stationIsInMix(station): Observable<boolean> {
    return this.pianodService.stationIsInMix(station);
  }

  openManageSeeds(stationName) {
    this.manageSeedsRef =
        this.dialog.open(ManageSeedsComponent, {disableClose : false});
    this.manageSeedsRef.componentInstance.station = stationName;
    this.manageSeedsRef.afterClosed().subscribe(
        results => { this.manageSeedsRef = null; });
  }

  openRenameDialog(stationName) {
    this.renameDialogRef =
        this.dialog.open(InputDialogComponent, {disableClose : true});
    this.renameDialogRef.componentInstance.title =
        `Rename station ${stationName}`;
    this.renameDialogRef.componentInstance.inputValue = stationName;
    this.renameDialogRef.afterClosed().subscribe((newName: string) => {
      if (newName) {
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
}
