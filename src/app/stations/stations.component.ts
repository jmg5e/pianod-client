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
  mixList = [];

  constructor(private pianodService: PianodService) {
    this.currentStation = this.pianodService.currentStation$;
  }

  ngOnInit() {
    this.pianodService.stations$.subscribe((stations) => {
      // console.log('got stations');
      this.stations = stations;
    });

    this.pianodService.mixList$.subscribe((mixList) => {
      // console.log('got mixList');
      // console.log(mixList);
      this.mixList = mixList;
    });
  }
  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }
}
