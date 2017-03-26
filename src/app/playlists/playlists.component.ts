import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-playlists',
  templateUrl : './playlists.component.html',
  styleUrls : [ './playlists.component.scss' ]
})
export class PlaylistsComponent implements AfterViewChecked, OnInit {
  playLists: Array<any>;
  constructor(private pianodService: PianodService) { this.playLists = []; }
  ngAfterViewChecked() {}
  ngOnInit() {
    this.pianodService.getPlaylists().subscribe(playlists => this.playLists =
                                                    playlists);
  }
  getPlaylistSongs(playlist) {
    console.log('getting playlist songs');
    this.pianodService.getPlaylistSongList(playlist.ID);
  }

  getPlaylistSeeds(playlist) {
    console.log('getting playlist seeds');
    this.pianodService.getPlaylistSeeds(playlist.ID)
        .then(seeds => console.log(seeds));
  }
  play(playlist) { console.log('playing playlist'); }
}
