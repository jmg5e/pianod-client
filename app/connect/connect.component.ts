import {Component, NgZone, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {ModalDialogService} from 'nativescript-angular/directives/dialogs';
import dialogs = require('ui/dialogs');

import {Connection, LoginInfo} from '../models';
import {LocalStorageService} from '../services/local-storage.service';
import {PianodService} from '../services/pianod.service';
import {ConnectService} from '../services/connect.service';
import {ConnectModalComponent} from './connect.modal';

@Component({
  selector: 'app-connect',
  moduleId: module.id,
  templateUrl: './connect.component.html',
})

export class ConnectComponent implements OnInit, OnDestroy {
  storedConnections: Array<Connection>;

  public constructor(
      private modalService: ModalDialogService, private viewRef: ViewContainerRef,
      private connectService: ConnectService, private pianodService: PianodService,
      private localStorageService: LocalStorageService) {}

  public ngOnInit() {
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  public ngOnDestroy() {}

  clearData() {
    this.localStorageService.clearData();
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  deleteConnection(connection) {
    this.localStorageService.deleteSavedConnection(connection);
    this.storedConnections = this.localStorageService.getStoredConnections();
  }

  addConnection() {
    const options = {context: {}, fullscreen: true, viewContainerRef: this.viewRef};
    this.modalService.showModal(ConnectModalComponent, options).then((res: Connection) => {
      if (res) {
        if (this.isValidConnection(res.host, res.port)) {
          this.localStorageService.saveConnection(res.host.trim(), res.port);
          this.storedConnections = this.localStorageService.getStoredConnections();
        } else {
          console.log('invalid connection');
        }
      }
    });
  }

  connect(connection: Connection) {
    this.pianodService.connect(connection.host, connection.port);
  }

  setDefaultConnection(conn: Connection) {
    this.localStorageService.toggleDefaultConnection(conn);
  }

  // TODO  actually validate input!
  isValidConnection(host: string, port: number) {
    return true;
  }


  openConnectionMenu(conn: Connection) {
    dialogs
        .action({message: '', cancelButtonText: 'Cancel', actions: ['Connect', 'Set As Default']})
        .then(result => {
          switch (result) {
            case 'Connect': {
              this.pianodService.connect(conn.host, conn.port);
              break;
              }
            case 'Set As Default': {
              this.localStorageService.toggleDefaultConnection(conn);
              // statements;
              break;
            }
            default: { break; }
          }
        });
  }
}
