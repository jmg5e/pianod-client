import {Component, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialogRef} from '@angular/material';

import {Playlist} from '../models/playlist';

@Component({
  selector : 'app-playlist-select-dialog',
  template : `
    <h2 md-dialog-title> {{title}} </h2>
    <md-list *ngFor="let playlist of playlists">
        <md-list-item >
            <button md-raised-button color="primary" style="width:100%" (click)="dialogRef.close(playlist)">{{playlist.Name}}</button>
        </md-list-item>
    </md-list>`
})

export class PlaylistSelectDialogComponent implements OnInit {

  config: MdDialogConfig = new MdDialogConfig();
  playlists: Array<Playlist>;
  title: string;
  constructor(public dialogRef: MdDialogRef<PlaylistSelectDialogComponent>) {}

  ngOnInit() {}
}
