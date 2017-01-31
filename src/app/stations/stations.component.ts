import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
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
  stations = [];
  currentStation;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  getStations() {
    // console.log(this.pianodService);
    // this.pianodService.sendCmd('stations');
    this.pianodService.getStations().then(
        (stations) => { console.log(stations); });
    // this.pianodService.sendCmd('stations').then((stations) => {
    //   console.log(stations);
    //   // this.stations = stations;
    // });
  }
}
