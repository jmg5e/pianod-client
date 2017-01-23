import {Component, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.css' ]
})
export class NowPlayingComponent implements OnInit {

  constructor() { console.log('now playing constructed'); }

  ngOnInit() { console.log('now playing OnInit'); }
}
