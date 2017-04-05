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
  sources;
  category = 'Any';
  searching = false;
  selectStationDialogRef: MdDialogRef<StationSelectDialogComponent>;
  selectedSource;
  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.getSources().subscribe(
        sources => { this.sources = sources; });
  }

  search(searchTerm, category) {
    this.searching = true;
    this.pianodService.search(searchTerm, category, this.selectedSource)
        .then((results: any) => {
          this.searchResults = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }

  createPlaylist(seed: Seed) {
    console.log('create playlist');
    // this.pianodService.sendCmd(`CREATE STATION FROM SUGGESTION ${seed.ID}`)
    //     .then(res => {
    //       if (!res.error) {
    //         this.stationsModified.emit('New station was succesfully
    //         created.');
    //       }
    //     });
  }
  addToQueue(seed) {
    console.log('adding to queue');
    // this.pianodService.sendCmd(`REQUEST where ID=\"${seed.ID}\"`)
    this.pianodService.sendCmd(`REQUEST ID \"${seed.ID}\"`)
        .then(res => console.log(res))
        .catch(err => console.log('catch' + err));
  }

  addToPlaylist(seed) { console.log('select playlist to add to'); }

  addSeedToPlaylist(seedId, playlist) {
    // this.pianodService
    //     .sendCmd(`ADD SEED FROM SUGGESTION ${seedId} TO \"${stationName}\"`)
    //     .then((res) => {
    //       if (!res.error) {
    //         this.stationsModified.emit('New seed was succesfully added to ' +
    //                                    stationName);
    //       }
    //     });
  }
}
