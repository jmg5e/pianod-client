import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {LoginDialogComponent} from '../dialogs';
import {Connection, LoginInfo} from '../models';
import {ConnectService, LocalStorageService, PianodService} from '../services';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})

export class ConnectComponent implements OnInit {
  connectForm;
  loginDialogRef: MdDialogRef<LoginDialogComponent>;
  connecting = false;  // show conecting spinner
  barConfig = new MdSnackBarConfig();
  storedConnections: Array<Connection>;

  constructor(
      private pianodService: PianodService, private snackBar: MdSnackBar, public dialog: MdDialog,
      private localStorageService: LocalStorageService, private connectService: ConnectService,
      private fb: FormBuilder) {
    this.barConfig.duration = 3000;

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
      // console.log('invalid connection');
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
          if (res.error) {
            this.snackBar.open('Failed to connect to pianod.', '', this.barConfig);
          } else {
            this.snackBar.open('Connected to pianod.', '', this.barConfig);
          }
        })
        .catch(err => {
          this.connecting = false;
        });
  }

  // TODO validate user input
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
