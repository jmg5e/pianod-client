import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SongInfo} from '../shared/models/song';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.scss' ]
})
export class NowPlayingComponent implements AfterViewChecked, OnInit {
  // @Input() songInfo: SongInfo;
  // @Input() playback: string;
  remainingTime$;
  // playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];
  song: SongInfo;
  song$;
  constructor(private pianodService: PianodService) {
    // this.pianodService.playback$( playback => {
    //
    // });
  }
  ngAfterViewChecked() {}
  ngOnInit() {
    this.remainingTime$ = this.pianodService.getSongRemainingTime();
    // this.remainingTime$.subscribe(t => console.log(t));
    // this.remainingTime$ =
    // this.pianodService.getSongRemainingTime().subscribe(
    //     t => console.log(t));
    // this.pianodService.getSongRemainingTime().subscribe(
    //     result => { console.log(result); });
    this.pianodService.getSong().subscribe(song => this.song = song);
  }
}
