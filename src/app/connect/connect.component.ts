import 'rxjs/add/observable/interval';

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {LocalStorageService} from '../local-storage.service';
import {PianodService} from '../pianod.service';

@Component({
  selector : 'app-connect',
  templateUrl : './connect.component.html',
  styleUrls : [ './connect.component.scss' ]
})

export class ConnectComponent implements OnInit {

  // @Output() connectState: boolean = false;
  @Output() userConnected = new EventEmitter<boolean>();
  public pianodUrl: string;
  // connected;
  hostname: string = 'localhost';
  port: number = 4446;
  connected: boolean = false;
  connecting: boolean = true; // show conecting spinner
  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar,
              private localStorageService: LocalStorageService) {}

  ngOnInit() {
    this.pianodUrl = this.localStorageService.get('pianodUrl');
    if (this.pianodUrl && typeof this.pianodUrl === 'string') {
      // console.log('auto connect');
      this.connect();
    } else {
      this.connecting = false;
    }

    this.pianodService.connected$.subscribe((state) => {
      this.userConnected.emit(state);
      // lost connection
      if (this.connected && state === false) {
        // this.snackBar.open('lost connection to pianod');
      }
      this.connected = state;
    });
  }

  onSubmit() {
    this.pianodUrl = `ws://${this.hostname}:${this.port}/pianod`;
    this.connect();
  }

  connect() {
    this.pianodService.connect(this.pianodUrl);
    this.connecting = true;

    setTimeout(() => {
      this.connecting = false; // no longer show spinner
      if (this.connected === false) {
        this.snackBar.open('failed to connect to pianod');
      } else {
        this.localStorageService.save('pianodUrl', this.pianodUrl);
        this.userConnected.emit(this.connected);
      }
    }, 1000);
  }
}
