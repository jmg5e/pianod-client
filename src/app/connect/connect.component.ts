import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {
  Connection,
  LocalStorageService,
  LoginInfo
} from '../shared/local-storage.service';
import {
  LoginDialogComponent
} from '../shared/login-dialog/login-dialog.component';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-connect',
  templateUrl : './connect.component.html',
  styleUrls : [ './connect.component.scss' ]
})

export class ConnectComponent implements OnInit {
  connectForm;
  dialogRef: MdDialogRef<LoginDialogComponent>;
  connecting = false; // show conecting spinner
  barConfig = new MdSnackBarConfig();
  storedConnections: Array<Connection>;

  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar, public dialog: MdDialog,
              private localStorageService: LocalStorageService,
              private fb: FormBuilder) {

    this.barConfig.duration = 3000;

    this.connectForm = fb.group({
      host : [ null, Validators.required ],
      port : [ null, Validators.required ]
    });
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  ngOnInit() { this.autoConnect(); }

  private autoConnect() {
    this.storedConnections.map(conn => {
      if (conn.auto_connect) {
        this.connect(conn.host, conn.port);
      }
    });
  }
  submitForm(form) { this.connect(form.host.trim(), form.port); }

  saveConnection(form) {
    if (form.host && form.port) {
      this.localStorageService.saveConnection(form.host, form.port);
      this.storedConnections = this.localStorageService.getStoredConnections();
    }
  }

  toggleAutoConnect(connection: Connection) {
    this.localStorageService.toggleAutoConnect(connection);
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

  connect(host, port) {
    this.connecting = false;
    try {
      this.pianodService.connect(host, port).then(res => {
        this.connecting = false;
        if (res.error) {
          this.snackBar.open('failed to connect to pianod', '', this.barConfig);
        }
      });
    } catch (err) {
      this.connecting = false;
    }
  }

  setDefaultUser(connection: Connection) {
    this.dialogRef =
        this.dialog.open(LoginDialogComponent, {disableClose : false});

    this.dialogRef.afterClosed().subscribe((loginInput: LoginInfo) => {
      if (loginInput) {
        this.localStorageService.setDefaultUser(connection, loginInput);
        this.storedConnections =
            this.localStorageService.getStoredConnections();
      }
      this.dialogRef = null;
    });
  }
}
