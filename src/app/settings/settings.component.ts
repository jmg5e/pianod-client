import {Component, OnInit} from '@angular/core';

import {Source} from '../shared/models/source';
import {PianodService} from '../shared/pianod.service';

@Component(
    {selector : 'app-settings', templateUrl : './settings.component.html'})

export class SettingsComponent implements OnInit {
  sources;
  availableSources;
  constructor(private pianodService: PianodService) {}

  ngOnInit() {

    this.pianodService.getSources().subscribe(sources => this.sources =
                                                  sources);
    // this.getSources();
  }

  selectSource(source) {
    // console.log(source);
    if (source.ID) {
      this.pianodService.sendCmd(`SOURCE SELECT ID ${source.ID}`)
          .then(res => console.log(res));
    }
  }
  enableSource(source) {
    if (source.Name) {
      this.pianodService.sendCmd(`${source.Source} use ${source.Name}`)
          .then(res => console.log(res));
    }
  }

  // async getSources() {
  //
  //   await this.pianodService.getSources().then(
  //       sources => { this.sources = sources; });
  //
  //   await this.pianodService.getAvalaibleSources().then(
  //       sources => { this.availableSources = sources; });
  //
  //   const allSource = this.sources.concat(this.availableSources);
  //   this.sources = allSource.map(source => {
  //     if (source.ID) {
  //       source.enabled = true;
  //     } else {
  //       source.enabled = false;
  //     }
  //     return {...source, type : source.Source};
  //   });
  // }
}
