import 'rxjs/add/observable/interval';

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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

  // @Output() userConnected = new EventEmitter<boolean>();
  public pianodUrl: string;
  connectForm;
  connected: boolean = false;
  connecting: boolean = true; // show conecting spinner
  barConfig = new MdSnackBarConfig();

  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar,
              private localStorageService: LocalStorageService,
              private fb: FormBuilder) {
    this.barConfig.duration = 3000;

    this.connectForm = fb.group({
      host : [ null, Validators.required ],
      port : [ null, Validators.required ]
    });
  }

  ngOnInit() {
    this.pianodUrl = this.localStorageService.get('pianodUrl');
    if (this.pianodUrl && typeof this.pianodUrl === 'string') {
      // console.log('auto connect');
      this.connect(this.pianodUrl);
    } else {
      this.connecting = false;
    }

    this.pianodService.connected$.subscribe(connected => this.connected =
                                                connected);
  }

  submitForm(form) {
    this.pianodUrl = `ws://${form.host.trim()}:${form.port}/pianod`;
    this.connect(this.pianodUrl);
  }

  connect(url) {
    this.connecting = true;
    this.pianodService.connect(url);

    setTimeout(() => {
      this.connecting = false; // no longer show spinner
      if (this.connected === false) {
        this.snackBar.open('failed to connect to pianod', '', this.barConfig);
      } else {
        this.localStorageService.save('pianodUrl', url);
      }
    }, 2000);
  }
}
