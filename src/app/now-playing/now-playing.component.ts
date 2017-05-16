import {Component, Input, OnInit} from '@angular/core';
// import {RouterModule, Routes} from '@angular/router';

import {Observable} from 'rxjs/Observable';
import {SongInfo} from '../shared/models/song';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.scss' ]
})
export class NowPlayingComponent implements OnInit {
  remainingTime: Observable<string>;
  song: Observable<SongInfo>;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.remainingTime = this.pianodService.getSongRemainingTime();
    // this.pianodService.getSong().subscribe(song => this.song = song);
    this.song = this.pianodService.getSong();
  }
}
