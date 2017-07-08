import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {RouterExtensions} from 'nativescript-angular/router';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import dialogs = require('ui/dialogs');

import {PianodService} from '../../services/pianod.service';

@Component({
  selector: 'app-stations',
  moduleId: module.id,
  templateUrl: './stations.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class StationsComponent implements OnInit, OnDestroy {
  stations: Array<string>;
  stations$: Subscription;
  mixList: Array<string>;
  mixList$: Subscription;
  currentStation: string;
  currentStation$: Subscription;
  public constructor(
      private pianodService: PianodService, private router: RouterExtensions,
      private ngZone: NgZone) {
    this.stations = [];

    this.mixList = [];
  }

  public ngOnInit() {
    this.stations$ = this.pianodService.getStations().subscribe(stations => {
      this.ngZone.run(() => {
        this.stations = stations;
      });

      this.mixList$ = this.pianodService.getMixList().subscribe(mixList => {
        this.ngZone.run(() => {
          this.mixList = mixList;
        });
      });
    });

    this.currentStation$ = this.pianodService.getCurrentStation().subscribe(station => {
      this.ngZone.run(() => {
        this.currentStation = station;
      });
    });
  }

  ngOnDestroy() {
    if (this.stations$) {
      this.stations$.unsubscribe();
      }
    if (this.currentStation$) {
      this.currentStation$.unsubscribe();
    }
  }

  goStationDetails(station) {
    this.router.navigate(['Home', {outlets: {'Stations': ['Stations', station]}}]);
  }

  goMixDetails() {
    this.router.navigate(['Home', {outlets: {'Stations': ['Stations', 'Mix']}}]);
  }

  openStationMenu(station) {
    dialogs.action({message: station, cancelButtonText: 'Cancel', actions: ['Play', 'Toggle Mix']})
        .then(result => {
          switch (result) {
            case 'Play': {
              this.playStation(station);
              break;
              }
            case 'Toggle Mix': {
              this.pianodService.toggleStationInMix(station);
              break;
            }
            default: { break; }
          }
        });
  }

  openMixMenu() {
    dialogs.action({message: 'Mix', cancelButtonText: 'Cancel', actions: ['Play']}).then(result => {
      switch (result) {
        case 'Play': {
          this.pianodService.sendCmd('PLAY MIX');
          break;
        }
        default: { break; }
      }
    });
  }


  playStation(station: string) {
    this.pianodService.sendCmd(`PLAY STATION \"${station}\"`);
  }

  stationIsPlaying(station): Observable<boolean> {
    return this.pianodService.stationIsPlaying(station);
  }

  stationIsInMix(station): Observable<boolean> {
    return this.pianodService.stationIsInMix(station);
  }
}
