import {Component, OnInit} from '@angular/core';
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
  stations = [];
  currentStation;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.user$.subscribe((user: User) => {
      // this.user = user;
      if (user.loggedIn) {
        this.pianodService.getStations().then((stations) => {
          this.stations = stations;
          // console.log(stations);
        });
      }
    });
  }
  playStation(stationName) {
    this.pianodService.sendCmd(`PLAY STATION \"${stationName}\"`);
  }

  // getStations() {
  //   this.pianodService.getStations().then((stations) => {
  //     this.stations = stations;
  //     console.log(stations);
  //   });
  // }
}
