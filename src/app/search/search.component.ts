import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PianodService} from '../pianod.service';
import {Seed} from '../seed';
@Component({
  selector : 'app-search',
  templateUrl : './search.component.html',
  styleUrls : [ './search.component.scss' ]
})

export class SearchComponent implements OnInit {
  results: Array<Seed>;
  stationList: Array<string>;
  category = 'Artist';
  searching = false;
  selectedSeed: string;
  selectedStation: string;
  @Output() stationsModified = new EventEmitter();
  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.stations$.subscribe((stations) => {
      this.stationList = stations.map(station => station.Name);
    });
  }

  search(searchTerm, category) {
    this.searching = true;
    this.selectedSeed = null;
    this.pianodService.search(searchTerm, category)
        .then((results: any) => {
          // console.log(results);
          this.results = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }

  createStation(seedId) {
    this.pianodService.sendCmd(`CREATE STATION FROM SUGGESTION ${seedId}`)
        .then(res => {
          if (!res.error) {
            this.stationsModified.emit('New station was succesfully created.');
          }
        });
  }

  addToStation(seedId, stationName) {
    this.pianodService
        .sendCmd(`ADD SEED FROM SUGGESTION ${seedId} TO \"${stationName}\"`)
        .then((res) => {
          console.log(res);
          if (!res.error) {
            this.stationsModified.emit('New seed was succesfully added to ' +
                                       stationName);
            this.pianodService.updateStations();
          }
        });
  }

  selectSeed(seedId) { this.selectedSeed = seedId; }
  // removeSelection() { this.selectedSeed = null; }
}
