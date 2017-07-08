import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as Toast from 'nativescript-toast';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {SearchBar} from 'ui/search-bar';

import dialogs = require('ui/dialogs');
import {Seed} from '../../models';
import {PianodService} from '../../services/pianod.service';

// needed for removing searchbar focus
import * as app from 'application';
declare var android: any;  // bypass the TS warnings

@Component({
  selector: 'app-search',
  moduleId: module.id,
  templateUrl: './search.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent implements OnInit, OnDestroy {
  stations: Array<string>;
  stations$: Subscription;
  searchOptions = ['Artist', 'Any', 'Genre'];
  searchResults: Array<Seed>;
  searchResults$: Subscription;
  searchFor = 'Any';
  isSearching = false;
  public constructor(private pianodService: PianodService, private ngZone: NgZone) {
    this.stations = [];
  }

  public ngOnInit() {
    this.stations$ = this.pianodService.getStations().subscribe(stations => {
      this.ngZone.run(() => {
        this.stations = stations;
      });
    });

    this.searchResults$ = this.pianodService.getSearchResults().subscribe(results => {
      this.ngZone.run(() => {
        this.searchResults = results;
      });
    });
  }

  public ngOnDestroy() {
    if (this.stations$) {
      this.stations$.unsubscribe();
    }
  }

  public onSubmit(args) {
    // close keyboard
    if (args.object.android) {
      args.object.android.clearFocus();
      }

    let searchBar = <SearchBar>args.object;
    this.isSearching = true;
    this.pianodService.search(searchBar.text, 'Any')
        .then(results => {
          this.isSearching = false;
          // this.searchResults = results;
        })
        .catch(err => this.isSearching = false);
  }

  public openMenu(seed: Seed) {
    dialogs
        .action({
          message: 'Seed Options',
          cancelButtonText: 'Cancel',
          actions: ['New Station', 'Add To Station']
        })
        .then(result => {
          switch (result) {
            case 'New Station': {
              this.createStation(seed);
              break;
              }
            case 'Add To Station': {
              this.addToStation(seed);
              break;
            }
            default: { break; }
          }
        });
  }

  private selectStation() {
    dialogs.action({message: 'Add To Station', cancelButtonText: 'Cancel', actions: this.stations})
        .then(result => {
          return result;
        });
  }

  public onTextChanged(args) {
    let searchBar = <SearchBar>args.object;
  }

  // prevent search bar focus on page load
  onSearchBarLoaded(event) {
    if (event.object.android) {
      event.object.android.clearFocus();
    }
  }

  createStation(seed: Seed) {
    if (seed.ID) {
      this.pianodService.createStation(seed).then(res => {
        if (!res.error) {
          Toast.makeText('New Station Created').show();
        }
      });
    }
  }

  addToStation(seed: Seed) {
    dialogs.action({message: 'Add To Station', cancelButtonText: 'Cancel', actions: this.stations})
        .then(result => {
          if (result !== 'Cancel') {
            const station = result;
            this.pianodService.addSeedToStation(seed, station).then(res => {

              if (!res.error) {
                Toast.makeText(`Seed Succesfully Added to Station: ${station}`).show();
              }
            });
          }
        });
  }

  public selectedIndexChanged(picker) {
    this.searchFor = this.searchOptions[picker.selectedIndex];
  }
}
