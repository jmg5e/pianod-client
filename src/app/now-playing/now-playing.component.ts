import {Component, Input, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SongInfo} from '../song-info';
@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.css' ]
})
export class NowPlayingComponent implements OnInit {
  @Input() songInfo: SongInfo;

  constructor() {}

  ngOnInit() {}
}
