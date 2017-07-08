// import {Component, OnInit} from '@angular/core';
import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RouterExtensions} from 'nativescript-angular/router';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {PianodService} from '../../services/pianod.service';

@Component({
  selector: 'ns-mixlist',
  moduleId: module.id,
  templateUrl: './mixlist.component.html',
})

export class MixListComponent implements OnInit, OnDestroy {
  stations: Array<string>;
  stations$: Subscription;
  mixList: Array<string>;
  mixList$: Subscription;

  constructor(
      private route: ActivatedRoute, private router: RouterExtensions,
      private pianodService: PianodService, private ngZone: NgZone) {}

  ngOnInit() {
    this.stations$ = this.pianodService.getStations().subscribe(stations => {
      this.ngZone.run(() => {
        this.stations = stations;
      });
    });
    this.mixList$ = this.pianodService.getMixList().subscribe(mixList => {
      this.ngZone.run(() => {
        this.mixList = mixList;
      });
    });
  }

  ngOnDestroy() {
    if (this.stations$) {
      this.stations$.unsubscribe();
      }
    if (this.mixList$) {
      this.mixList$.unsubscribe();
    }
  }

  playMix() {
    this.pianodService.sendCmd(`PLAY MIX`);
  }

  mixIsPlaying(): Observable<boolean> {
    return this.pianodService.stationIsPlaying('mix QuickMix');
  }

  toggleStationInMix(station) {
    this.pianodService.toggleStationInMix(station);
  }

  goBack() {
    this.router.navigate(['Home', {outlets: {'Stations': ['Stations']}}]);
  }

  stationIsInMix(station): Observable<boolean> {
    return this.pianodService.stationIsInMix(station);
  }
}
