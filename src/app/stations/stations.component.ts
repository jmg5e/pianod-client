import {Component, Input, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
import {User} from '../user';
@Component({
  selector : 'app-stations',
  templateUrl : './stations.component.html',
  styleUrls : [ './stations.component.scss' ]
})
export class StationsComponent implements OnInit {
  /* would be realy cool if i could subscribe to some custom event
   * for example
   * message -> 135 Station list has changed
   * pianodService.createObservableForCode(135)
  */
  @Input() station;
  currentStation;
  stations = [];
  mixList: Array<string> = [];

  constructor(private pianodService: PianodService) {
    this.currentStation = this.pianodService.currentStation$;
  }

  ngOnInit() {
    this.pianodService.stations$.subscribe((stations) => {
      // console.log('got stations');
      this.stations = stations;
    });

    this.pianodService.mixList$.subscribe((mixList) => {
      this.mixList =
          mixList.map(station => station.Name.replace('Station', '').trim());
    });
  }

  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }

  inMix(stationName) { return (this.mixList.indexOf(stationName) !== -1); }

  toggleInMix(stationName) {
    this.pianodService.sendCmd(`MIX TOGGLE\"${stationName}\"`);
  }
  deleteSeed(seedId) {
    console.log('deleting seed');
    this.pianodService.sendCmd(`DELETE SEED ${seedId}`).then((res) => {
      console.log(res);
    });
  }
}
