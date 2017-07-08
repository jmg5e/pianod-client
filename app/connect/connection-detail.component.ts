import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RouterExtensions} from 'nativescript-angular/router';

import dialogs = require('ui/dialogs');
import {Connection, LoginInfo} from '../models';
import {LocalStorageService} from '../services/local-storage.service';
import {PianodService} from '../services/pianod.service';

@Component({
  selector: 'app-connection-detail',
  moduleId: module.id,
  templateUrl: './connection-detail.component.html',
})

export class ConnectionDetailComponent implements OnInit, OnDestroy {
  connection: Connection;

  public constructor(
      private routerExtensions: RouterExtensions, private route: ActivatedRoute,
      private pianodService: PianodService, private localStorageService: LocalStorageService) {}

  public ngOnInit() {
    this.connection = this.getConnection();
    if (!this.connection) {
      // TODO router gaurd for connection not found?
      console.log('connection could not be found!');
      this.routerExtensions.navigate(['/Connect'], {clearHistory: true});
    }
  }

  public ngOnDestroy() {}

  public connect() {
    this.pianodService.connect(this.connection.host, this.connection.port);
  }

  private getConnection() {
    const host = this.route.snapshot.params['host'];
    const port = +this.route.snapshot.params['port'];
    return this.localStorageService.getConnection(host, port);
  }

  public deleteConnection() {
    this.localStorageService.deleteSavedConnection(this.connection);
    this.routerExtensions.navigate(['/Connect'], {clearHistory: true});
  }

  public editUser() {
    dialogs
        .login({
          title: 'Set Default User',
          okButtonText: 'Ok',
          cancelButtonText: 'Cancel',
          neutralButtonText: 'Clear',
          userName: '',
          password: ''
        })
        .then(r => {
          if (r.result && r.userName && r.password) {
            const loginInfo: LoginInfo = {username: r.userName.trim(), password: r.password};
            this.localStorageService.setDefaultUser(this.connection, loginInfo);
            this.connection =
                this.localStorageService.getConnection(this.connection.host, this.connection.port);
            }
          if (r.result === undefined) {
            this.clearUser();
          }
        });
  }

  public toggleDefault() {
    this.localStorageService.toggleDefaultConnection(this.connection);
  }

  public clearUser() {
    this.localStorageService.removeDefaultUser(this.connection);
    this.connection = this.getConnection();
  }
}
