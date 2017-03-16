import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {Seed} from '../shared/models/seed';
import {PianodService} from '../shared/pianod.service';
import {
  StationSelectDialogComponent
} from '../shared/station-select-dialog/station-select-dialog.component';

@Component({
  selector : 'app-search',
  templateUrl : './search.component.html',
  styleUrls : [ './search.component.scss' ]
})

export class SearchComponent implements OnInit {

  searchResults: Array<Seed>;
  // @Input() stationList: Array<string>;
  stationList: Array<string>;
  category = 'Any';
  searching = false;
  selectStationDialogRef: MdDialogRef<StationSelectDialogComponent>;
  @Output() stationsModified = new EventEmitter();

  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.stations$.subscribe(
        stationList => { this.stationList = stationList; });
  }

  search(searchTerm, category) {
    this.searching = true;
    this.pianodService.search(searchTerm, category)
        .then((results: any) => {
          this.searchResults = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }

  createStation(seed: Seed) {
    this.pianodService.sendCmd(`CREATE STATION FROM SUGGESTION ${seed.ID}`)
        .then(res => {
          if (!res.error) {
            this.stationsModified.emit('New station was succesfully created.');
          }
        });
  }

  addToStation(seed) {
    this.selectStationDialogRef =
        this.dialog.open(StationSelectDialogComponent);
    this.selectStationDialogRef.componentInstance.stationList =
        this.stationList;

    this.selectStationDialogRef.componentInstance.dialogTitle = 'Add Seed To Station';
    this.selectStationDialogRef.afterClosed().subscribe(
        (selectedStation: string) => {
          if (selectedStation) {
            this.addSeedToStation(seed.ID, selectedStation);
          }
          this.selectStationDialogRef = null;
        });
  }

  addSeedToStation(seedId, stationName) {
    this.pianodService
        .sendCmd(`ADD SEED FROM SUGGESTION ${seedId} TO \"${stationName}\"`)
        .then((res) => {
          if (!res.error) {
            this.stationsModified.emit('New seed was succesfully added to ' +
                                       stationName);
            this.pianodService.updateStations();
          }
        });
  }
}
