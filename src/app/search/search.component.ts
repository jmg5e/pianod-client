import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';

@Component({
  selector : 'app-search',
  templateUrl : './search.component.html',
  styleUrls : [ './search.component.scss' ]
})

export class SearchComponent implements OnInit {
  results = [];
  stationList = [];
  category = 'Artist';
  searching: boolean = false;
  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.stations$.subscribe((stations) => {
      this.stationList = stations.map(station => station.Name);
    });
  }

  search(searchTerm, category) {
    this.searching = true;
    this.pianodService.search(searchTerm, category)
        .then((results: any) => {
          // console.log(results);
          this.results = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }

  createStation(seedId) {
    this.pianodService.sendCmd(`CREATE STATION FROM SUGGESTION ${seedId}`);
  }

  addToStation(seedId, stationName) {
    this.pianodService
        .sendCmd(`ADD SEED FROM SUGGESTION ${seedId} TO ${stationName}`)
        .then((res) => {
          if (res.msg.code === 200) {
            this.pianodService.updateStations();
          }
        });
  }
}
