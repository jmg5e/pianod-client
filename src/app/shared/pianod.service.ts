import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/catch';

import {Injectable} from '@angular/core';
import * as Async from 'async';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {Message} from './models/message';
import {Seed} from './models/seed';
import {Song, SongInfo} from './models/song';
import {User} from './models/user';

@Injectable()
export class PianodService {
  responseTimeout = 2000;
  connectionInfo;
  pianodMessages$: Observable<Message>;
  private connected = new BehaviorSubject<boolean>(false);
  private playback = new BehaviorSubject<string>('STOPPED');
  private error = new Subject<string>();
  private currentStation = new BehaviorSubject<string>('');
  private stations = new Subject<any>();
  private mixList = new Subject<any>();
  private user = new BehaviorSubject<User>(new User());
  private song: Song = new Song();
  private songInfo = new BehaviorSubject<SongInfo>(this.song.data);
  private userInfo: User = new User();
  private socket: WebSocket;
  private q;

  constructor() {
    // limit concurrency of socket commands to 1
    // using libarary async js queue to solve this problem
    this.q = Async.queue((cmd, done) => {
      this.doSendCmd(cmd).then(res => done(res)).catch(err => done(err));
    }, 1);
  }

  public getConnectionState() { return this.connected.asObservable(); }
  public getPlayback() { return this.playback.asObservable(); }
  public getErrors() { return this.error.asObservable(); }
  public getSong() { return this.songInfo.asObservable(); }
  public getUser() { return this.user.asObservable(); }
  public getCurrentStation() { return this.currentStation.asObservable(); }
  public getStations() { return this.stations.asObservable(); }
  public getMixList() { return this.mixList.asObservable(); }

  // should get a response when first connecting to socket
  public async connect(host, port) {
    const url = `ws://${host}:${port}/pianod`;
    this.socket = new WebSocket(url);
    // this.socket.onerror = function(err) {
    //   console.log('error');
    //   console.log(err);
    // };
    // TODO I dont like this but works
    setTimeout(() => {
      if (this.socket.readyState !== 1) {
        return Promise.reject(`websocket failed to connect ${url}`);
      }
    }, 100);

    const response = await this.getResponse();
    if (!response.error && response.msg === 'Connected') {
      this.connectionInfo = {host : host, port : port};
      this.connected.next(true);
      this.user.next(new User());
    }

    this.listen();
    return response;
  };

  public async disconnect() {
    await this.sendCmd('QUIT');
    this.socket.close();
  }

  // just reconnect to socket without elevated permissions
  public logout() {
    if (this.socket.OPEN && this.socket.url) {
      this.connect(this.connectionInfo.host, this.connectionInfo.port);
    }
  }

  // get all incoming socket messages
  public getMessages() { return this.pianodMessages$; }

  // sendCmd -> pushes cmd to queue -> doSendCmd() -> getResponse
  public sendCmd(cmd): Promise<any> {
    return new Promise(
        (resolve, reject) => { this.q.push(cmd, (res) => resolve(res)); });
  }

  public async getStationSeeds(stationName) {
    const seedResponse: any =
        await this.sendCmd(`station seeds \"${stationName}\"`);
    // get seeds for station, transform seed array into a single object
    const seeds: Array<Seed> = seedResponse.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return seeds;
  }

  private async updateStations() {
    // get list of stations
    const response = await this.sendCmd('stations');

    const stations = response.data.reduce(
        (results, dataPacket) => dataPacket.map(station => station.Station),
        []);

    return stations;
  }

  public async search(searchTerm, category) {
    const response = await this.sendCmd(`FIND ${category} \"${searchTerm}\"`);
    // map data packet of seed array into an object
    const results = response.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return results;
  }

  public getSongRemainingTime(): Observable<any> {
    return this.song.getSongRemainingTime();
  }

  private async updateMixList() {
    // get list of stations
    const response = await this.sendCmd('mix list');

    // get list of stations from dataPacket and rename property
    const mixList =
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

  // listen for ALL incoming socket messaged
  private listen() {
    this.pianodMessages$ =
        Observable.fromEvent(this.socket, 'message')
            .filter((event: any) => Message.isValid(event.data))
            .map((msg: any) => new Message(msg.data));
    this.handleRuntime();
    this.socket.onclose = () => {
      this.connectionInfo = undefined;
      this.connected.next(false);
      this.user.next(new User());
    };
  }

  // pass message to update pianod state unless message is an error or is a data
  // request
  private handleRuntime() {
    let dataRequest = false;
    this.pianodMessages$.subscribe((msg: Message) => {
      if (msg.error) {
        this.error.next(msg.content);
        dataRequest = false;
      }
      if (msg.code === 203) {
        dataRequest = true;
      }
      if (msg.code === 204) {
        dataRequest = false;
      }
      if (!dataRequest) {
        this.updatePianod(msg);
      }
    });
  }

  // get response from incoming socket messages
  // see  documentation/protocal.md for pianod dataRequest protocol
  private getResponse(): Promise<any> {
    const response$ = new Subject<any>();
    let dataRequest = false;
    let dataPacket = [];
    const data = [];
    const msgs = [];

    // observe response from socket messages
    const pianodMsgs$ = Observable.fromEvent(this.socket, 'message');

    // this works i think but breaks unit tests
    // const pianodMsgs$= Observable.fromEvent(this.socket,
    // 'message').timeout(this.responseTimeout, Promise.resolve({error: true,
    // msg: 'TimeoutError'});

    pianodMsgs$.filter((event: any) => Message.isValid(event.data))
        .map((event: any) => new Message(event.data))
        .takeUntil(response$)
        .subscribe(
            (msg: Message) => {
              msgs.push(msg); // for debugging purposes only
              if (msg.error) {
                response$.next({error : true, msg : msg.content, msgs : msgs});
                response$.complete();
                // end$.error({error : true, msg : msg.content, msgs : msgs});
              } else if (msg.code === 203) { // start of data request
                if (dataRequest) {           // Multiple data packets
                  data.push(dataPacket);
                }
                dataPacket = [];
                dataRequest = true;
              } else if (msg.code === 200) { // success
                response$.next(
                    {error : msg.error, msg : msg.content, msgs : msgs});
                response$.complete();
              } else if (msg.code === 204) { // end of data request
                if (dataPacket.length > 0) {
                  data.push(dataPacket);
                }
                response$.next({error : msg.error, data : data});
                response$.complete();
              } else if (dataRequest) {
                dataPacket.push(msg.data);
              }
            },
            error => {
              response$.next({error : true, msg : error.name});
              response$.complete();
            });

    // setTimeout(response$.error('TimoutError'), this.responseTimeout);
    //
    // return Promise.race([ timeoutPromise, end$.toPromise() ]);

    return response$.toPromise();
  }

  // update pianod state from a message
  private updatePianod(msg: Message) {
    if (msg.data) {
      this.song.update(msg.data);
      this.songInfo.next(this.song.data);
    }

    if (msg.code > 100 && msg.code < 107) { // playback
      this.updatePlayback(msg);
      if (msg.code === 101) {
        this.song.setTime(msg.content);
      }
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
      this.updateStations().then(stationList =>
                                     this.stations.next(stationList));
    }
    // mixList changed
    if (msg.code === 134) {
      this.updateMixList().then(mixList => this.mixList.next(mixList));
    }
    // user logged in
    if (msg.code === 136) {
      this.userInfo.update(msg);
      this.user.next(this.userInfo);
      this.updateStations().then(stationList =>
                                     this.stations.next(stationList));
      this.updateMixList().then(mixList => this.mixList.next(mixList));
    }
  }

  private updatePlayback(msg: Message) {
    switch (msg.code) {
    case 101:
      this.playback.next('PLAYING');
      this.song.startTimer();
      break;
    case 102:
      this.playback.next('PAUSED');
      this.song.stopTimer();
      break;
    case 103:
      this.playback.next('STOPPED');
      this.song.clearTime();
      // clear song info
      this.songInfo.next(this.song.clearSong());
      break;
    };
  }
}
