import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';
import {PianodService} from '../../shared/pianod.service';
@Component({
  selector : 'app-manage-seeds',
  templateUrl : './manage-seeds.component.html',
  styleUrls : [ './manage-seeds.component.scss' ]
})
export class ManageSeedsComponent implements OnInit {

  station: string;
  seeds: Array<any> = [];
  constructor(public dialogRef: MdDialogRef<ManageSeedsComponent>,
              private pianodService: PianodService) {}

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
