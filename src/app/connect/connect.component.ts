import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {LocalStorageService} from '../shared/local-storage.service';
import {PianodService} from '../shared/pianod.service';
// import 'rxjs/add/observable/interval';

@Component({
  selector : 'app-connect',
  templateUrl : './connect.component.html',
  styleUrls : [ './connect.component.scss' ]
})

export class ConnectComponent implements OnInit {

  connectForm;
  connecting = false; // show conecting spinner
  barConfig = new MdSnackBarConfig();
  favorites: Array<any>;
  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar,
              private localStorageService: LocalStorageService,
              private fb: FormBuilder) {
    this.barConfig.duration = 3000;

    this.connectForm = fb.group({
      host : [ null, Validators.required ],
      port : [ null, Validators.required ]
    });
    this.favorites = this.localStorageService.getFavorites();
  }

  ngOnInit() { this.autoConnect(); }
  private autoConnect() {
    this.localStorageService.favorites.map(item => {
      if (item.auto_connect) {
        // console.log('auto connect');
        // console.log(item);
        this.connect(item.host, item.port);
      }
    });
  }
  submitForm(form) {
    let url = `ws://${form.host.trim()}:${form.port}/pianod`;
    this.connect(form.host, form.port);
  }

  addToFavorites(form) {
    if (form.host && form.port) {
      this.localStorageService.addToFavorites(form.host, form.port);
      this.favorites = this.localStorageService.getFavorites();
    }
  }

  toggleAutoConnect(item) {
    this.localStorageService.toggleAutoConnect(item);
    this.favorites = this.localStorageService.getFavorites();
  }

  removeFromFavorites(item) {
    this.localStorageService.removeFromFavorites(item);
    this.favorites = this.localStorageService.getFavorites();
  }

  connect(host, port) {
    let url = `ws://${host.trim()}:${port}/pianod`;
    this.connecting = false;
    try {
      this.pianodService.connect(url)
          .then(res => {
            this.connecting = false;
            if (res.error) {
              this.snackBar.open('failed to connect to pianod', '',
                                 this.barConfig);
            }
          })
          .catch(error => {
            this.connecting = false;
            this.snackBar.open('failed to connect to pianod', '',
                               this.barConfig);
          });
    } catch (err) {
      this.connecting = false;
    }
  }
}
