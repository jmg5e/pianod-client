import {Component, Input, OnInit} from '@angular/core';
// import {RouterModule, Routes} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {SongInfo, SongTime} from '../models';
import {PianodService} from '../services';

@Component({
  selector: 'app-now-playing',
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss']
})
export class NowPlayingComponent implements OnInit {
  playedTime: Observable<SongTime>;
  song: Observable<SongInfo>;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.playedTime = this.pianodService.getSongPlayedTime();
    // .map(playedTime => playedTime.toString());
    // this.pianodService.getSong().subscribe(song => this.song = song);
    this.song = this.pianodService.getSong();
  }
}
