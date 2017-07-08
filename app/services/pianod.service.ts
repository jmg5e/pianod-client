import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/catch';
require('nativescript-websockets');

import {Injectable} from '@angular/core';
import * as queue from 'async.queue'
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';

import {Connection, Message, Seed, Song, SongInfo, SongTime, User, UserInfo} from '../models';

@Injectable()
export class PianodService {
  responseTimeout = 2000;  // ms to timeout response
  searchTimeout = 6000;
  connectionInfo: Connection;
  pianodMessages$: Observable<Message>;

  private searchResults = new Subject<Seed[]>();
  private connected = new BehaviorSubject<boolean>(false);
  private playback = new BehaviorSubject<string>('STOPPED');
  private error = new Subject<string>();
  private currentStation = new BehaviorSubject<string>('');
  private stations = new BehaviorSubject<Array<string>>([]);
  private mixList = new BehaviorSubject<Array<string>>([]);
  private song: Song = new Song();
  private songInfo = new BehaviorSubject<SongInfo>(this.song.data);
  private user: User = new User();
  private userInfo = new BehaviorSubject<UserInfo>(this.user.getUserInfo());
  private socket: WebSocket;
  private q;

  constructor() {
    // limit concurrency of socket commands to 1
    // using libarary async js queue to solve this problem
    this.q = queue(({cmd: cmd, responseTimeout: responseTimeout}, done) => {
      this.doSendCmd(cmd, responseTimeout).then(res => done(res)).catch(err => done(err));
    }, 1);
  }

  public getConnectionState(): Observable<boolean> {
    return this.connected.asObservable();
  }
  public getPlayback(): Observable<string> {
    return this.playback.asObservable();
  }
  public getErrors() {
    return this.error.asObservable();
  }
  public getSong(): Observable<SongInfo> {
    return this.songInfo.asObservable();
  }
  public getUser(): Observable<UserInfo> {
    return this.userInfo.asObservable();
  }
  public getCurrentStation(): Observable<string> {
    return this.currentStation.asObservable();
  }
  public getStations(): Observable<string[]> {
    return this.stations.asObservable();
  }
  public getMixList() {
    return this.mixList.asObservable();
  }

  public getSearchResults() {
    return this.searchResults.asObservable();
  }

  // should get a response when first connecting to socket
  public async connect(host, port) {
    const url = `ws://${host}:${port}/pianod`;
    try {
      this.socket = new WebSocket(url);

      // wait for socket ready
      await Observable.fromEvent(this.socket, 'open').take(1).timeout(1000).toPromise();

      const response = await this.getResponse(this.responseTimeout);
      if (!response.error && response.msg === 'Connected') {
        this.connectionInfo = {host: host, port: port};
        this.user = new User();
        this.userInfo.next(this.user.getUserInfo());
        this.connected.next(true);
      }

      this.listen();
      return response;
    } catch (err) {
      this.error.next('Failed to connect to pianod');
      return Promise.reject(`websocket failed to connect ${url}`);
    }
  }

  public async disconnect() {
    await this.sendCmd('QUIT');
    this.socket.close();
  }

  // just reconnect to socket with new user with no permissions
  public logout() {
    if (this.socket.OPEN && this.socket.url) {
      this.connect(this.connectionInfo.host, this.connectionInfo.port);
    }
  }

  // get all incoming socket messages
  public getMessages() {
    return this.pianodMessages$;
  }

  // sendCmd -> pushes cmd to queue -> doSendCmd() -> getResponse
  public sendCmd(cmd, responseTimeout?: number): Promise<any> {
    responseTimeout = responseTimeout ? responseTimeout : this.responseTimeout;
    return new Promise((resolve, reject) => {
      this.q.push({cmd: cmd, responseTimeout: responseTimeout}, (res) => resolve(res));
    });
  }

  public async login(userName, password) {
    const response = await this.sendCmd(`USER ${userName} ${password}`);
    if (!response.error) {
      this.user.name = userName;
      }

    return response;
  }

  public stationIsPlaying(station: string): Observable<boolean> {
    return this.currentStation.asObservable().map(currentStation => currentStation === station);
  }

  public stationIsInMix(station: string): Observable<boolean> {
    return this.mixList.asObservable().map(mixList => mixList.indexOf(station) !== -1);
  }

  public toggleStationInMix(station: string) {
    if (this.mixList.value.length > 1 || this.mixList.value.indexOf(station) === -1) {
      this.sendCmd(`MIX TOGGLE \"${station}\"`);
    }
  }

  public async getStationSeeds(stationName) {
    const seedResponse: any = await this.sendCmd(`station seeds \"${stationName}\"`);
    // get seeds for station, transform seed array into a single object
    const seeds: Array<Seed> =
        seedResponse.data.map((seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return seeds;
  }

  // two ways to get results: via promise callback or subscribe to getSearchResults()
  public async search(searchTerm, category) {
    const response = await this.sendCmd(`FIND ${category} \"${searchTerm}\"`, 6000);
    // map data packet of seed array into an object
    const results =
        response.data.map((seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));

    this.searchResults.next(results);
    return results;
  }

  public async createStation(seed: Seed) {
    const results = await this.sendCmd(`CREATE STATION FROM SUGGESTION ${seed.ID}`);
    return results;
  }

  public async addSeedToStation(seed: Seed, station: string) {
    const results = await this.sendCmd(`ADD SEED FROM SUGGESTION ${seed.ID} TO \"${station}\"`);
    return results;
  }

  public getSongPlayedTime(): Observable<SongTime> {
    return this.song.getSongPlayedTime();
  }

  private async updateStations() {
    // get list of stations
    const response = await this.sendCmd('stations');

    const stations = response.data.reduce(
        (results, dataPacket) => dataPacket.map(station => station.Station), []);

    this.stations.next(stations);
    return stations;
  }

  private async updateMixList() {
    // get list of stations
    const response = await this.sendCmd('mix list');

    const mixList = response.data.reduce(
        (results, dataPacket) => dataPacket.map(station => station.Station), []);
    this.mixList.next(mixList);
    return mixList;
  }

  // send command to socket and listen for response
  private doSendCmd(cmd, responseTimeout): Promise<any> {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(cmd);
      return this.getResponse(responseTimeout);  // return promise
    } else {
      this.error.next('Not Connected to Pianod Service');
      return Promise.reject('Not Connected to Pianod Service');
    }
  }

  // listen for ALL incoming socket messaged
  private listen() {
    this.pianodMessages$ = Observable.fromEvent(this.socket, 'message')
                               .filter((event: any) => Message.isValid(event.data))
                               .map((msg: any) => new Message(msg.data));
    this.handleRuntime();
    this.socket.onclose = () => {
      this.connectionInfo = undefined;
      this.connected.next(false);
      this.user = new User();
      this.userInfo.next(this.user.getUserInfo());
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
  private getResponse(responseTimeout?: number): Promise<any> {
    responseTimeout = responseTimeout ? responseTimeout : this.responseTimeout;
    const response$ = new Subject<any>();
    let dataRequest = false;
    let dataPacket = [];
    const data = [];
    const msgs = [];

    // get response from socket messages
    const pianodMsgs$ = Observable.fromEvent(this.socket, 'message').timeout(responseTimeout);

    pianodMsgs$.filter((event: any) => Message.isValid(event.data))
        .map((event: any) => new Message(event.data))
        .takeUntil(response$)
        .subscribe(
            (msg: Message) => {
              msgs.push(msg);  // for debugging purposes only
              if (msg.error) {
                response$.next({error: true, msg: msg.content, msgs: msgs, data: data});
                response$.complete();
              } else if (msg.code === 203) {  // start of data request
                if (dataRequest) {            // Multiple data packets
                  data.push(dataPacket);
                }
                dataPacket = [];
                dataRequest = true;
              } else if (msg.code === 200) {  // success
                response$.next({error: msg.error, msg: msg.content, msgs: msgs});
                response$.complete();
              } else if (msg.code === 204) {  // end of data request
                if (dataPacket.length > 0) {
                  data.push(dataPacket);
                }
                response$.next({error: msg.error, data: data});
                response$.complete();
              } else if (dataRequest) {
                dataPacket.push(msg.data);
              }
            },
            error => {
              response$.next({error: true, msg: error.name, data: data});
              response$.complete();
            });

    return response$.toPromise();
  }

  // update pianod state from a message
  private updatePianod(msg: Message) {
    if (msg.data) {
      this.song.update(msg.data);
      this.songInfo.next(this.song.data);
      }

    if (msg.code > 100 && msg.code < 107) {  // playback
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
      this.currentStation.next(msg.data.SelectedStation.replace('station ', ''));
      }
    // stationList changed
    if (msg.code === 135) {
      this.updateStations();
      }

    // mixList changed
    if (msg.code === 134) {
      this.updateMixList();
      }
    // user logged in
    if (msg.code === 136) {
      this.user.setPrivileges(msg);
      this.userInfo.next(this.user.getUserInfo());
      this.updateStations();
      this.updateMixList();
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
        this.song.stopTimer();
        this.song.clearTime();
        // clear song info
        this.songInfo.next(this.song.clearSong());
        break;
    };
  }
}
