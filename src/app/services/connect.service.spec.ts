import {Location} from '@angular/common';
import {Component} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {Router, Routes} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {Connection} from '../models';
import {ConnectService} from '../services/connect.service';
import {LocalStorageService} from '../services/local-storage.service';
import {PianodService} from '../services/pianod.service';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;

import * as config from '../../../config';
const mockPianod = config.mockPianod || {'port': 4201, 'host': 'localhost'};

@Component({selector: 'app-dummy', template: `<h2> DummyComponent </h2>`})
export class DummyComponent {
  }

const routes: Routes = [
  {path: '', redirectTo: '/Connect', pathMatch: 'full'},
  {path: 'Connect', component: DummyComponent}, {path: 'Home', component: DummyComponent}
];

// TODO: fix issue with injecting NotificationService, and other unnecessary stuff
xdescribe('ConnectService', () => {
  beforeEach(() => {
    // mock local storage
    const storage = {
      'storedConnections': [{'host': mockPianod.host, 'port': mockPianod.port, 'isDefault': true}]
    };
    window.localStorage.setItem('Pianod', JSON.stringify(storage));
    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [PianodService, LocalStorageService, ConnectService]
    });
  });

  beforeEach(inject(
      [PianodService, ConnectService, Router], (s: PianodService, c: ConnectService, r: Router) => {
        this.pianodService = s;
        this.router = r;
      }));

  it('isValidConnection should return true for valid connections', () => {
    expect(ConnectService.isValidConnection('google.com', 4603)).toBeTruthy();
    expect(ConnectService.isValidConnection('127.0.0.1', 4201)).toBeTruthy();
    expect(ConnectService.isValidConnection('4601', 4201)).toBeTruthy();
    expect(ConnectService.isValidConnection('test.foob.ar', 4201)).toBeTruthy();
  });

  it('isValidConnection should return false for invalid connections', () => {
    expect(ConnectService.isValidConnection('google.com', 42.3)).toBeFalsy();
    expect(ConnectService.isValidConnection('google.com', -4201)).toBeFalsy();
    expect(ConnectService.isValidConnection('127.0.0.1', 0)).toBeFalsy();
    expect(ConnectService.isValidConnection('jkfd@jkfdkd.com', 4201)).toBeFalsy();
    expect(ConnectService.isValidConnection('@mfd.com', 4201)).toBeFalsy();
    expect(ConnectService.isValidConnection('!jkfd.com', 4201)).toBeFalsy();
    expect(ConnectService.isValidConnection('@mfd.com', 4201)).toBeFalsy();
  });

  it('should automatically connect to mock pianod socket with valid defaultConnection', (done) => {
    this.pianodService.getConnectionState().take(2).toArray().subscribe(connected => {
      expect(connected).toEqual([false, true]);
      expect(this.pianodService.connectionInfo).toEqual(mockPianod);
    }, err => console.log(err), () => done());
  });

  it('should navigate to Home route after automatically connecting', (done) => {
    this.router.events.filter(e => e.constructor.name === 'NavigationEnd')
        .map(e => e.url)
        .take(2)
        .toArray()
        .subscribe(route => {
          expect(route).toEqual(['/Connect', '/Home']);
        }, err => console.log(err), () => done());
  });

  it('should navigate to Connect route after disconnect', (done) => {
    this.router.events.filter(e => e.constructor.name === 'NavigationEnd')
        .map(e => e.url)
        .take(3)
        .toArray()
        .subscribe(route => {
          expect(route).toEqual(['/Connect', '/Home', '/Connect']);
        }, err => console.log(err), () => done());

    // disconnect after connected
    this.pianodService.getConnectionState()
        .takeWhile(connected => connected === true)
        .toPromise()
        .then(() => {
          this.pianodService.disconnect();
        });
  });

});
