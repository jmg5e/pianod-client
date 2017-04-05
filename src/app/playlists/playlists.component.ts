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
    this.pianodService.getPlaylistSongList(playlist.ID)
        .then(songs => console.log(songs));
  }

  getPlaylistSeeds(playlist) {
    this.pianodService.getPlaylistSeeds(playlist.ID)
        .then(seeds => console.log(seeds));
  }
  selectPlaylist(playlist) {

    // `SELECT` will choose a playlist but not alter the play state (if paused
    // or stopped, it will remain paused).  `PLAY` chooses a playlist and starts
    // the player, resuming a track in progress if there is one.
    this.pianodService.sendCmd(`play playlist where ID=${playlist.ID}`)
        .then(res => console.log(res));
  }

  deletePlaylist(playlist) {
    this.pianodService.sendCmd(`PLAYLIST DELETE WHERE ID=${playlist.ID}`)
        .then(res => console.log(res));
  }
}