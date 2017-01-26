import {Component, Input, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PianodService} from '../pianod.service';
import {SongInfo} from '../song-info';
@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.scss' ]
})
export class NowPlayingComponent implements OnInit {
  @Input() songInfo: SongInfo;
  @Input() playback: string;
  playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];

  constructor(private pianodService: PianodService) {
    // console.log('now playing constructor');
  }

  play() { this.pianodService.sendCmd('play'); }
  pause() { this.pianodService.sendCmd('pause'); }
  ngOnInit() {}
}
