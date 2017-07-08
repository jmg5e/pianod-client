import {ChangeDetectionStrategy, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RouterExtensions} from 'nativescript-angular/router';
import {Subscription} from 'rxjs/Subscription';
import dialogs = require('ui/dialogs');

import {Seed} from '../../models';
import {PianodService} from '../../services/pianod.service';

@Component({
  selector: 'ns-station-details',
  moduleId: module.id,
  templateUrl: './station-detail.component.html',
})

export class StationDetailComponent implements OnInit, OnDestroy {
  station: string;
  station$: Subscription;
  seeds: Array<Seed>;
  // seeds$: Subscription;
  isPlaying: boolean;
  isPlaying$: Subscription;
  isInMix: boolean;
  isInMix$: Subscription;

  constructor(
      private route: ActivatedRoute, private router: RouterExtensions,
      private pianodService: PianodService, private ngZone: NgZone) {}

  ngOnInit(): void {
    const name = this.route.snapshot.params['name'];
    this.station = name;
    this.pianodService.getStationSeeds(this.station).then(seeds => {
      this.ngZone.run(() => {
        this.seeds = seeds;
      });
    });

    this.isPlaying$ = this.pianodService.stationIsPlaying(this.station).subscribe(isPlaying => {
      this.ngZone.run(() => {
        this.isPlaying = isPlaying;
      });
    });

    this.isInMix$ = this.pianodService.stationIsInMix(this.station).subscribe(isInMix => {
      this.ngZone.run(() => {
        this.isInMix = isInMix;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.isPlaying$) {
      this.isPlaying$.unsubscribe();
      }

    if (this.isInMix$) {
      this.isInMix$.unsubscribe();
    }
  }

  playStation() {
    this.pianodService.sendCmd(`PLAY STATION \"${this.station}\"`);
  }

  toggleStationInMix() {
    this.pianodService.toggleStationInMix(this.station);
  }

  public openStationMenu() {
    dialogs
        .action(
            {message: 'Station Options', cancelButtonText: 'Cancel', actions: ['Rename', 'Delete']})
        .then(result => {
          switch (result) {
            case 'Rename': {
              this.renameStation();
              break;
              }
            case 'Delete': {
              this.deleteStation();
              break;
            }
            default: { break; }
          }
        });
  }

  deleteStation() {
    dialogs.confirm('Are you sure you want to delete station?').then(result => {
      if (result) {
        this.pianodService.sendCmd(`DELETE STATION \"${this.station}"`).then(res => {
          if (!res.error) {
            this.goBack();
          }
        });
      }
    });
  }

  deleteSeed(seed: Seed) {
    dialogs.confirm('Are you sure you want to remove seed from station?').then(result => {
      if (result) {
        this.pianodService.sendCmd(`DELETE SEED ${seed.ID}`).then(res => {
          if (!res.error) {
            this.seeds = this.seeds.filter(s => s.ID !== seed.ID);
          }
        });
      }
    });
  }

  renameStation() {
    dialogs
        .prompt({
          message: 'Rename Station: ' + this.station,
          okButtonText: 'Ok',
          cancelButtonText: 'Cancel',
          defaultText: this.station,
        })
        .then(r => {
          if (r.result && r.text) {
            this.pianodService.sendCmd(`RENAME STATION \"${this.station}\" TO \"${r.text}\"`)
                .then(res => {
                  if (!res.error) {
                    this.station = r.text;
                  }
                });
          }
        });
  }

  openSeedMenu(seed: Seed) {
    dialogs.action({message: 'Seed Options', cancelButtonText: 'Cancel', actions: ['Delete']})
        .then(result => {
          switch (result) {
            case 'Delete': {
              this.deleteSeed(seed);
              break;
            }
            default: { break; }
          }
        });
  }

  goBack() {
    this.router.navigate(['Home', {outlets: {'Stations': ['Stations']}}]);
  }
}
