import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {InputDialogComponent} from '../shared/dialogs/input-dialog.component';
import {
  PlaylistSelectDialogComponent
} from '../shared/dialogs/playlist-select-dialog.component';
import {Playlist, Seed, Source} from '../shared/models';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-search',
  templateUrl : './search.component.html',
  styleUrls : [ './search.component.scss' ]
})

export class SearchComponent implements OnInit {

  searchResults: Array<Seed>;
  playlists: Array<Playlist>;
  sources: Array<Source>;
  category = 'Artist';
  manner = 'All';
  searching = false;
  selectPlaylistDialogRef: MdDialogRef<PlaylistSelectDialogComponent>;
  namePlaylistDialogRef: MdDialogRef<InputDialogComponent>;
  constructor(private pianodService: PianodService, public dialog: MdDialog) {}

  ngOnInit() {
    this.pianodService.getSources().subscribe(
        sources => { this.sources = sources; });

    this.pianodService.getPlaylists().subscribe(
        playlists => { this.playlists = playlists; });
  }

  search(searchTerm, category, manner) {
    // console.log(` searching for ${searchTerm} ${manner} where ${category}`);
    this.searching = true;
    this.pianodService.search(searchTerm, category, manner)
        .then((results: any) => {
          this.searchResults = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }

  async createPlaylist(seed: Seed) {
    // SOURCE SELECT ID ${source.ID}
    // SOURCE SELECT TYPE {type} NAME {name}
    const selectResponse = await this.pianodService.sendCmd(
        `source select type ${seed.Source} NAME \"${seed.Name}\"`);
    console.log(selectResponse);

    const playlistName = await this.openNamePlaylistDialog(seed);
    this.namePlaylistDialogRef = null;
    console.log(playlistName);
    if (playlistName) {
      const response = await this.pianodService.sendCmd(
          `PLAYLIST CREATE NAME \"${playlistName}\" FROM ID
        \"${seed.ID}\"`);
      console.log(response);
    }
  }

  addToQueue(seed) {
    console.log('adding to queue');
    // this.pianodService.sendCmd(`REQUEST where ID=\"${seed.ID}\"`)
    this.pianodService.sendCmd(`REQUEST ID \"${seed.ID}\"`)
        .then(res => console.log(res))
        .catch(err => console.log('catch' + err));
  }

  openNamePlaylistDialog(seed: Seed) {
    this.namePlaylistDialogRef =
        this.dialog.open(InputDialogComponent, {disableClose : true});
    this.namePlaylistDialogRef.componentInstance.title = 'Name New Station';
    return this.namePlaylistDialogRef.afterClosed().toPromise();
  }

  openSelectPlaylistDialog(): Promise<Playlist> {
    this.selectPlaylistDialogRef =
        this.dialog.open(PlaylistSelectDialogComponent, {disableClose : true});

    this.selectPlaylistDialogRef.componentInstance.title =
        'Add Seed To Playlist.';
    this.selectPlaylistDialogRef.componentInstance.playlists = this.playlists;
    return this.selectPlaylistDialogRef.afterClosed().toPromise();
  }

  async addToPlaylist(seed) {
    const selectedPlaylist = await this.openSelectPlaylistDialog();
    if (selectedPlaylist) {
      this.pianodService
          .sendCmd(
              `seed add id ${seed.ID} to playlist id ${selectedPlaylist.ID}`)
          .then(res => console.log(res));
    }
  }
}
