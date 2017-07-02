import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {StationSelectDialogComponent} from '../../dialogs';
import {PianodService} from '../../services';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html'
})

export class ControlsComponent implements OnInit, OnDestroy {
  selectStationDialogRef: MdDialogRef<StationSelectDialogComponent>;
  playback: Observable<string>;
  playbackOptions = ['PLAYING', 'PAUSED', 'STOPPED'];
  currentStation: Observable<string>;
  stationList: Observable<string[]>;
  @Input() privileges;

  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.playback = this.pianodService.getPlayback();
    this.stationList = this.pianodService.getStations();
    this.currentStation = this.pianodService.getCurrentStation();
  }

  ngOnDestroy() {
  }

  play() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PLAY');
    }
  }

  pause() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PAUSE');
    }
  }

  stop() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('STOP NOW');
    }
  }

  playStation(stationName) {
    if (this.privileges.admin) {
      this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
    }
  }

  playMix() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PLAY MIX');
    }
  }

  // selectStation() {
  //   this.selectStationDialogRef = this.dialog.open(StationSelectDialogComponent);
  //   this.selectStationDialogRef.componentInstance.stationList = this.stationList;
  //   this.selectStationDialogRef.componentInstance.dialogTitle = 'Play Station';
  //   this.selectStationDialogRef.afterClosed().subscribe((selectedStation: string) => {
  //     if (selectedStation) {
  //       this.playStation(selectedStation);
  //     }
  //     this.selectStationDialogRef = null;
  //   });
  // }
}
