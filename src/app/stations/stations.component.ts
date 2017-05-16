import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

import {
  ConfirmDialogComponent,
  InputDialogComponent,
} from '../shared/dialogs';
import {User} from '../shared/models/user';
import {PianodService} from '../shared/pianod.service';

import {ManageSeedsComponent} from './manage-seeds.component';

@Component({
  selector : 'app-stations',
  templateUrl : './stations.component.html',
  styleUrls : [ './stations.component.scss' ]
})

export class StationsComponent implements OnInit, OnDestroy {
  confirmDialogRef: MdDialogRef<ConfirmDialogComponent>;
  renameDialogRef: MdDialogRef<InputDialogComponent>;
  manageSeedsRef: MdDialogRef<ManageSeedsComponent>;
  currentStation: string;
  stationList: Array<string> = [];
  mixList$;
  stationList$;
  mixList: Array<string> = [];
  @Output() stationsModified = new EventEmitter();

  constructor(private pianodService: PianodService, private router: Router,
              public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.getStations().subscribe(
        stationList => { this.stationList = stationList; });

    this.mixList$ = this.pianodService.getMixList().subscribe(
        (mixList) => this.mixList = mixList);

    this.stationList$ = this.pianodService.getCurrentStation().subscribe(
        currentStation => this.currentStation = currentStation);
  }
  ngOnDestroy() {
    this.mixList$.unsubscribe();
    this.stationList$.unsubscribe();
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

  selectStation(station) { this.router.navigate([ '/Stations', station ]); }
  deleteStation(stationName) {
    this.pianodService.sendCmd(`DELETE STATION \"${stationName}\"`)
        .then(res => {
          if (!res.error) {
            this.stationsModified.emit('Station ' + stationName +
                                       ' was successfully deleted.');
          }
        });
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
