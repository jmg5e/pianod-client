import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

import {Playlist, Seed} from '../shared/models';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-edit-seeds',
  template : `<h2 md-dialog-title> Playlist: {{playlist.Name}}</h2>
    <md-toolbar *ngFor="let seed of seeds">
        <span *ngIf="seed.Artist">Artist : {{seed?.Artist}}</span>
        <span *ngIf="seed.Song">Song : {{seed?.Song}}</span>
        <span *ngIf="seed.Genre">Genre : {{seed?.Genre}}</span>
        <span class="fill-space"> </span>
        <button md-button (click)="deleteSeed(seed)" color="warn"><md-icon>delete</md-icon></button>
    </md-toolbar>`
})
export class EditSeedsComponent implements OnInit {
  playlist: Playlist;
  seeds: Array<Seed> = [];
  constructor(public dialogRef: MdDialogRef<EditSeedsComponent>,
              private pianodService: PianodService) {}

  ngOnInit() {
    if (this.playlist) {
      this.pianodService.getPlaylistSeeds(this.playlist).then(seeds => {
        console.log(seeds);
        this.seeds = seeds;
      });
    }
  }

  // toggleSeed() {}

  async deleteSeed(seed) {
    //       SEED {verb} [{type}] [{seeds_predicate}] [TO PLAYLIST
    // {playlist_predicate}]
    // PLAYLIST MODIFY {playlist_predicate} {verb} SEED {verb} {seeds_predicate}
    //
    // Where:
    //
    // * _verb_ is `add`, `delete` or `toggle`
    // * _seeds_predicate_ specifies the songs, artists, albums or playlists to
    // add or
    // remove as seeds; if omitted, uses the current song.  Not all sources
    // support all
    // seed types.
    // * _playlist_predicate_ specifies playlists to apply the change to; if
    // omitted,
    // uses the current playlist/current track’s playlist (which must not
    // conflict).
    const response = await this.pianodService.sendCmd(
        `seed delete id \"${seed.ID}\" to playlist id \"${this.playlist.ID}\"`);
    console.log(response);
    if (!response.error) {
      this.seeds = this.seeds.filter(x => x.ID !== seed.ID);
    }
  }
}
