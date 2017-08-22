import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {LoginDialogComponent} from '../dialogs';
import {Connection, LoginInfo} from '../models';
import {ConnectService} from '../services/connect.service';
import {LocalStorageService} from '../services/local-storage.service';
import {PianodService} from '../services/pianod.service';
import {NotificationService} from '../services/notification.service';

@Component({selector: 'app-connect', templateUrl: './connect.component.html'})

export class ConnectComponent implements OnInit {
  connectForm;
  loginDialogRef: MdDialogRef<LoginDialogComponent>;
  connecting = false;  // conecting spinner
  storedConnections: Array<Connection>;

  constructor(
      private pianodService: PianodService, private notifcationService: NotificationService,
      public dialog: MdDialog, private localStorageService: LocalStorageService,
      private connectService: ConnectService, private fb: FormBuilder) {
    // TODO use custom validator
    this.connectForm =
        fb.group({host: [null, Validators.required], port: [null, Validators.required]});
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  ngOnInit() {}

  submitForm(form) {
    if (ConnectService.isValidConnection(form.host.trim(), form.port)) {
      const connection = {host: form.host.trim(), port: form.port};
      this.connect(connection);
    } else {
          this.notifcationService.showNotification('Invailid Connection');
    }
  }

  saveConnection(form) {
    if (ConnectService.isValidConnection(form.host.trim(), form.port)) {
      this.localStorageService.saveConnection(form.host.trim(), form.port);
      this.storedConnections = this.localStorageService.getStoredConnections();
    }
  }

  toggleDefaultConnection(connection: Connection) {
    this.localStorageService.toggleDefaultConnection(connection);
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  deleteSavedConnection(connection: Connection) {
    this.localStorageService.deleteSavedConnection(connection);
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  removeDefaultUser(connection: Connection) {
    this.localStorageService.removeDefaultUser(connection);
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  connect(connection: Connection) {
    this.connecting = false;
    this.connectService.connect(connection)
        .then(res => {
          this.connecting = false;
        })
        .catch(err => {
          this.connecting = false;
        });
  }

  setDefaultUser(connection: Connection) {
    this.loginDialogRef = this.dialog.open(LoginDialogComponent, {disableClose: false});

    this.loginDialogRef.componentInstance.dialogTitle = 'Set Default User';
    this.loginDialogRef.afterClosed().subscribe((loginInput: LoginInfo) => {
      if (loginInput) {
        this.localStorageService.setDefaultUser(connection, loginInput);
        this.storedConnections = this.localStorageService.getStoredConnections();
      }
      this.loginDialogRef = null;
    });
  }
}
