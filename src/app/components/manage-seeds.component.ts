import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';
import {PianodService} from '../services';

@Component({
  selector: 'app-manage-seeds',
  template: `<h2 md-dialog-title class="station-title"> Station: {{station}}</h2>
    <md-toolbar *ngFor="let seed of seeds">
        <app-seed [seed]="seed"> </app-seed>
        <span class="fill-space"> </span>
        <button md-button (click)="deleteSeed(seed.ID)" color="warn"><md-icon>delete</md-icon></button>
    </md-toolbar>`
})

export class ManageSeedsComponent implements OnInit {
  station: string;
  seeds: Array<any> = [];

  constructor(
      public dialogRef: MdDialogRef<ManageSeedsComponent>, private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.getStationSeeds(this.station).then(seeds => {
      this.seeds = seeds;
    });
  }

  deleteSeed(seedId) {
    this.pianodService.sendCmd(`DELETE SEED ${seedId}`).then(res => {
      if (!res.error) {
        this.seeds = this.seeds.filter(seed => seed.ID !== seedId);
      }
    });
  }
}
