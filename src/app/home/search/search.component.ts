import {Component, OnDestroy, OnInit} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {StationSelectDialogComponent} from '../../dialogs';
import {Seed} from '../../models';
import {NotificationService} from '../../services/notification.service';
import {PianodService} from '../../services/pianod.service';

@Component({selector: 'app-search', templateUrl: './search.component.html'})

export class SearchComponent implements OnInit, OnDestroy {
  searchResults: Observable<Seed[]>;
  stationList: Array<string>;
  stationList$: Subscription;
  category = 'Any';
  searching = false;
  selectStationDialogRef: MdDialogRef<StationSelectDialogComponent>;

  constructor(
      private pianodService: PianodService, private notifcationService: NotificationService,
      private dialog: MdDialog) {}

  ngOnInit() {
    this.searchResults = this.pianodService.getSearchResults();
    this.stationList$ = this.pianodService.getStations().subscribe(stationList => {
      this.stationList = stationList;
    });
  }

  ngOnDestroy() {
    if (this.stationList$) {
      this.stationList$.unsubscribe();
    }
    }

  async search(searchTerm, category) {
    this.searching = true;

    try {
      await this.pianodService.search(searchTerm, category);
      this.searching = false;
    } catch (err) {
      this.searching = false;
    }
  }

  createStation(seed: Seed) {
    this.pianodService.sendCmd(`CREATE STATION FROM SUGGESTION ${seed.ID}`).then(res => {
      if (!res.error) {
        this.notifcationService.showNotification(`Succesfully created new station`);
      } else {
        this.notifcationService.showNotification(`Error creating station`);
      }
    });
  }

  addToStation(seed) {
    this.selectStationDialogRef = this.dialog.open(StationSelectDialogComponent);
    this.selectStationDialogRef.componentInstance.stationList = this.stationList;

    this.selectStationDialogRef.componentInstance.dialogTitle = 'Add Seed To Station';
    this.selectStationDialogRef.afterClosed().subscribe((selectedStation: string) => {
      if (selectedStation) {
        this.addSeedToStation(seed.ID, selectedStation);
      }
      this.selectStationDialogRef = null;
    });
  }

  addSeedToStation(seedId, stationName) {
    this.pianodService.sendCmd(`ADD SEED FROM SUGGESTION ${seedId} TO \"${stationName}\"`)
        .then(res => {
          if (!res.error) {
            this.notifcationService.showNotification(`Seed was added to station ${stationName}`);
          } else {
            this.notifcationService.showNotification(`Error adding seed to station ${stationName}`);
          }
        });
  }
}
