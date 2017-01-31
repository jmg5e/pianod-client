import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil';

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {Message} from './message';
import {SongInfo} from './song-info';
import {User} from './user';

@Injectable()
export class PianodService {
  public responseTimeout: number = 5000;
  public connected$: Observable<boolean>;
  public error$: Observable<string>;
  public playback$: Observable<string>;
  public song$: Observable<SongInfo>;
  public user$: Observable<User>;
  private songInfo: SongInfo = new SongInfo();
  private userInfo: User = new User();
  private socket: WebSocket;
  private connected = new BehaviorSubject<boolean>(false);
  private playback = new BehaviorSubject<string>('STOPPED');
  private error = new Subject<string>();
  private song = new BehaviorSubject<SongInfo>(new SongInfo());
  private user = new BehaviorSubject<User>(new User());

  constructor() {
    this.connected$ = this.connected.asObservable();
    this.playback$ = this.playback.asObservable();
    this.error$ = this.error.asObservable();
    this.song$ = this.song.asObservable();
    this.user$ = this.user.asObservable();
  }

  // connect to websocket
  // TODO bugfix : should provide components with pianod state on socket
  // reconect
  // should get response when first connecting to pianod
  public async connect(url) {
    const self = this;
    this.socket = new WebSocket(url);
    let response = await this.getResponse(this.socket);

    if (response.msg.content === 'Connected') {
      self.connected.next(true);
      self.user.next(new User());
    }

    // this.socket.onopen = function() {
    //   self.connected.next(true);
    //   self.user.next(new User());
    // };
    this.socket.onclose = function() {
      console.log('socket closed');
      self.connected.next(false);
      self.user.next(new User());
      // retry connection
      // setTimeout(() => { self.connect(url); }, 2000);
    };
    // console.log('connect -> ', response);
    this.listen();
  };

  public disconnect() { this.socket.close(); }

  // just reconnect to socket, pianod service should handle everthing
  public logout() {
    if (this.socket.OPEN && this.socket.url) {
      let url = this.socket.url;
      this.connect(url);
      // this.user.next(new User());
    }
  }

  // TODO WRITE TESTS FOR THIS!
  // would be nice if i could mock socket response
  public async sendCmd(cmd) {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log('sending cmd ', cmd);
      this.socket.send(cmd);

      let results = await this.getResponse(this.socket);
      console.log('finished cmd ', cmd);

      return results;
    } else {
      this.error.next('Not Connected to Pianod Service');
    }
  }

  public async getStations() {

    let stations = await this.getStationList();
    return stations;
  }

  private async getStationList() {
    let stationList = await this.sendCmd('stations').then((res) => res.data);
    // flatten array
    stationList = stationList.reduce((acc, cur) => acc.concat(cur), []);
    // rename Station property to Name
    stationList = stationList.map(({Station : Station}) => ({Name : Station}));
    return stationList;
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
  }

  // get response from incoming socket messages
  // see  documentation/protocal.md for pianod dataRequest protocol
  private getResponse(socket) {
    const end$ = new Subject<any>();
    let dataRequest = false;
    let dataPacket = [];
    let data = [];
    // observe response from socket messages
    const response = Observable.fromEvent(socket, 'message');
    response.map((msg: any) => new Message(msg.data))
        .takeUntil(end$)
        .subscribe((msg: Message) => {
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
            end$.next({msg : msg});
            end$.complete();
          } else if (msg.code === 204) { // end of data request
            data.push(dataPacket);
            end$.next({msg : msg, data : data});
            end$.complete();
          } else if (dataRequest) {
            dataPacket.push(msg.data);
          }
        });

    setTimeout(function() { end$.error('ERROR: Response Timeout'); },
               this.responseTimeout);

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
      this.songInfo.SelectedStation = '';
    }

    if (msg.code === 136) {
      this.userInfo.update(msg);
      this.user.next(this.userInfo);
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
    };
  }
}
