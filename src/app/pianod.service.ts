import 'rxjs/add/observable/fromEvent';
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

import {Message} from './message';
import {SongInfo} from './song-info';
import {User} from './user';

@Injectable()
export class PianodService {
  public responseTimeout: number = 30000;
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
  private currentStation = new Subject<string>();
  private stations = new Subject<any>();
  private mixList = new Subject<any>();
  private song = new BehaviorSubject<SongInfo>(new SongInfo());
  private user = new BehaviorSubject<User>(new User());
  private songInfo: SongInfo = new SongInfo();
  private userInfo: User = new User();
  private socket: WebSocket;
  private q: any;

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
  // TODO bugfix : should provide components with pianod state on socket
  // reconect
  // should get a success response when first connecting to pianod
  public async connect(url) {
    const self = this;
    this.socket = new WebSocket(url);

    let response = await this.getResponse();
    if (response.msg.content === 'Connected') {
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

  // TODO WRITE TESTS FOR THIS!
  // would be nice if i could mock socket response
  // sendCmd -> pushes cmd to queue -> doSendCmd() -> getResponse
  public sendCmd(cmd): Promise<any> {
    return new Promise((resolve, reject) => {
      this.q.push(cmd, (res) => { return resolve(res); });
    });
  }

  public async getStations() {
    // get list of stations
    let response = await this.sendCmd('stations');
    let stations =
        response.data[0].map((station) => ({Name : station.Station}));

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

  public async getMixList() {
    // get list of stations
    let response = await this.sendCmd('mix list');
    let mixList = response.data[0].map((station) => ({Name : station.Station}));
    return mixList;
  }

  public async search(searchTerm, category) {
    let response = await this.sendCmd(`FIND ${category} \"${searchTerm}\"`);
    let results = response.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return results;
  }

  // send command to socket and listen for response
  private doSendCmd(cmd): Promise<any> {
    if (this.socket.readyState === WebSocket.OPEN) {
      // console.log('sending cmd ', cmd);
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
  private getResponse() {
    const end$ = new Subject<any>();
    let dataRequest = false;
    let dataPacket = [];
    let data = [];
    let msgs = [];
    // observe response from socket messages
    const response$ = Observable.fromEvent(this.socket, 'message');
    response$.map((msg: any) => new Message(msg.data))
        .takeUntil(end$)
        .catch((err) => { return Promise.reject({error : err, msgs : msgs}); })
        .subscribe((msg: Message) => {
          msgs.push(msg);
          if (msg.error) {
            end$.error(msg.content);
            // end$.next(msg);
            // end$.complete();
          } else if (msg.code === 203) { // start of data request
            if (dataRequest) {           // Multiple data packets
              data.push(dataPacket);
            }
            dataPacket = [];
            dataRequest = true;
          } else if (msg.code === 200) { // success
            end$.next({msgs : msgs, msg : msg});
            end$.complete();
          } else if (msg.code === 204) { // end of data request
            data.push(dataPacket);
            end$.next({msgs : msgs, msg : msg, data : data});
            end$.complete();
          } else if (dataRequest) {
            dataPacket.push(msg.data);
          }
        });

    setTimeout(() => {
      end$.error('ERROR: Response Timeout');
      // return Promise.reject(msgs);
    }, this.responseTimeout);

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
    if (msg.code === 109) {
      this.currentStation.next(msg.data.SelectedStation);
    }
    // stationList changed
    if (msg.code === 135) {
      this.getStations().then(
          (stationList) => { this.stations.next(stationList); });
    }
    // mixList changed
    if (msg.code === 134) {
      this.getMixList().then((mixList) => { this.mixList.next(mixList); });
    }
    // user logged in
    if (msg.code === 136) {
      this.userInfo.update(msg);
      this.user.next(this.userInfo);
      this.getStations().then(
          (stationList) => { this.stations.next(stationList); });
      this.getMixList().then((mixList) => { this.mixList.next(mixList); });
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
