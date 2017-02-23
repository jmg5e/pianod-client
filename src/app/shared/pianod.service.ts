import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/catch';

import {Injectable} from '@angular/core';
import * as Async from 'async';
// import * as d3 from 'd3-queue';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {Message} from './models/message';
import {SongInfo} from './models/song-info';
import {User} from './models/user';

@Injectable()
export class PianodService {
  public responseTimeout = 2000;
  public connected$: Observable<boolean>;
  public error$: Observable<string>;
  public playback$: Observable<string>;
  public song$: Observable<SongInfo>;
  public user$: Observable<User>;
  public stations$: Observable<any>;
  public mixList$: Observable<any>;
  public currentStation$: Observable<string>;

  private connected = new BehaviorSubject<boolean>(false);
  private playback = new BehaviorSubject<string>('STOPPED');
  private error = new Subject<string>();
  private currentStation = new BehaviorSubject<string>('');
  private stations = new Subject<any>();
  private mixList = new Subject<any>();
  private song = new BehaviorSubject<SongInfo>(new SongInfo());
  private user = new BehaviorSubject<User>(new User());
  private songInfo: SongInfo = new SongInfo();
  private userInfo: User = new User();
  private socket: WebSocket;
  private q;

  constructor() {
    this.connected$ = this.connected.asObservable();
    this.playback$ = this.playback.asObservable();
    this.error$ = this.error.asObservable();
    this.song$ = this.song.asObservable();
    this.user$ = this.user.asObservable();
    this.stations$ = this.stations.asObservable();
    this.mixList$ = this.mixList.asObservable();
    this.currentStation$ = this.currentStation.asObservable();
    // limit concurrency of socket commands to 1
    // using libarary async js queue to solve this problem
    this.q = Async.queue((cmd, done) => {
      this.doSendCmd(cmd).then(res => done(res)).catch(err => done(err));
    }, 1);
  }

  // connect to websocket
  // should get a response when first connecting to pianod
  public async connect(url) {
    const self = this;
    this.socket = new WebSocket(url);
    // this.socket.onerror = function(err) { console.log(err); };
    // has to be a better way
    setTimeout(() => {
      if (this.socket.readyState !== 1) {
        return Promise.reject(`websocket failed to connect ${url}`);
      }
    }, 100);

    let response = await this.getResponse();
    if (!response.error && response.msg === 'Connected') {
      this.connected.next(true);
      this.user.next(new User());
    }

    this.listen();
    return response;
  };

  public disconnect() { this.socket.close(); }

  // just reconnect to socket, pianod service should handle everthing
  public logout() {
    if (this.socket.OPEN && this.socket.url) {
      this.connect(this.socket.url);
    }
  }

  // sendCmd -> pushes cmd to queue -> doSendCmd() -> getResponse
  public sendCmd(cmd): Promise<any> {
    return new Promise(
        (resolve, reject) => { this.q.push(cmd, (res) => { resolve(res); }); });
  }

  // there is no event when adding/deleting station seeds
  // temporary fix... alow components to update stations
  public updateStations() {
    this.getStations().then(
        (stationList) => { this.stations.next(stationList); });
  }

  private async getStations() {
    // get list of stations
    let response = await this.sendCmd('stations');

    // get list of stations from dataPacket and rename property
    let stations =
        response.data.reduce((results, dataPacket) => dataPacket.map(
                                 station => ({Name : station.Station})),
                             []);

    // get seeds for each station
    stations = Promise.all(stations.map(async(station) => {
      let seeds: any;
      let seedResponse: any =
          await this.sendCmd(`station seeds \"${station.Name}\"`);
      // get seeds for station, transform seed array into a single object
      seeds = seedResponse.data.map(
          (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));

      Object.assign(station, {Seeds : seeds});
      return station;
    }));

    return stations;
  }

  public async search(searchTerm, category) {
    let response = await this.sendCmd(`FIND ${category} \"${searchTerm}\"`);
    // map data packet of seed array into an object
    let results = response.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return results;
  }

  private async getMixList() {
    // get list of stations
    let response = await this.sendCmd('mix list');

    // get list of stations from dataPacket and rename property
    let mixList =
        response.data.reduce((results, dataPacket) => dataPacket.map(
                                 station => ({Name : station.Station})),
                             []);
    return mixList;
  }

  // send command to socket and listen for response
  private doSendCmd(cmd): Promise<any> {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(cmd);
      return this.getResponse(); // return promise
    } else {
      this.error.next('Not Connected to Pianod Service');
      return Promise.reject('Not Connected to Pianod Service');
    }
  }

  // listen for ALL incoming socket messaged and update pianod
  // ignore dataRequests
  private listen() {
    const self = this;
    let dataRequest = false;
    this.socket.onmessage = function(event) {
      const msg = new Message(event.data);
      if (msg.error) {
        self.error.next(msg.content);
        dataRequest = false;
      }
      if (msg.code === 203) {
        dataRequest = true;
      }
      if (msg.code === 204) {
        dataRequest = false;
      }
      if (!dataRequest) {
        self.updatePianod(msg);
      }
    };

    this.socket.onclose = function() {
      // console.log('socket closed');
      self.connected.next(false);
      self.user.next(new User());
      // retry connection
      // setTimeout(() => { self.connect(url); }, 2000);
    };
  }

  // get response from incoming socket messages
  // see  documentation/protocal.md for pianod dataRequest protocol
  private getResponse(): Promise<any> {
    let end$ = new Subject<any>();
    let dataRequest = false;
    let dataPacket = [];
    let data = [];
    let msgs = [];

    // observe response from socket messages
    const response$ = Observable.fromEvent(this.socket, 'message');
    // this works i think but breaks units
    // const response$ = Observable.fromEvent(this.socket,
    // 'message').timeout(this.responseTimeout);

    response$.map((msg: any) => new Message(msg.data))
        .takeUntil(end$)
        .subscribe(
            (msg: Message) => {
              msgs.push(msg); // for debugging purposes only
              if (msg.error) {
                end$.next({error : true, msg : msg.content, msgs : msgs});
                end$.complete();
                // end$.error({error : true, msg : msg.content, msgs : msgs});
              } else if (msg.code === 203) { // start of data request
                if (dataRequest) {           // Multiple data packets
                  data.push(dataPacket);
                }
                dataPacket = [];
                dataRequest = true;
              } else if (msg.code === 200) { // success
                end$.next({error : msg.error, msg : msg.content});
                // end$.next({msgs : msgs, msg : msg});
                end$.complete();
              } else if (msg.code === 204) { // end of data request
                if (dataPacket.length > 0) {
                  data.push(dataPacket);
                }
                end$.next({error : msg.error, data : data});
                end$.complete();
              } else if (dataRequest) {
                dataPacket.push(msg.data);
              }
            },
            error => {
              end$.next({error : true, msg : error.name});
              end$.complete();
            });

    return end$.toPromise(); // async await with observables?
  }

  // update pianod
  private updatePianod(msg: Message) {
    if (msg.data) {
      this.songInfo.update(msg.data);
      this.song.next(this.songInfo);
    }
    if (msg.code > 100 && msg.code < 107) { // playback
      this.updatePlayback(msg);
    }
    // no station selected
    if (msg.code === 108) {
      this.currentStation.next('');
    }
    // Selected  Station
    if (msg.code === 109) {
      this.currentStation.next(
          msg.data.SelectedStation.replace('station ', ''));
    }
    // stationList changed
    if (msg.code === 135) {
      this.getStations().then(stationList => this.stations.next(stationList));
    }
    // mixList changed
    if (msg.code === 134) {
      this.getMixList().then(mixList => this.mixList.next(mixList));
    }
    // user logged in
    if (msg.code === 136) {
      this.userInfo.update(msg);
      this.user.next(this.userInfo);
      this.getStations().then(stationList => this.stations.next(stationList));
      this.getMixList().then(mixList => this.mixList.next(mixList));
    }
  }

  private updatePlayback(msg: Message) {
    switch (msg.code) {
    case 101:
      this.playback.next('PLAYING');
      break;
    case 102:
      this.playback.next('PAUSED');
      break;
    case 103:
      this.playback.next('STOPPED');
      break;
    };
  }
}
