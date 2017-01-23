import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/takeUntil';
// import 'rxjs/add/operator/take';
// import 'rxjs/add/operator/toArray';
// import 'rxjs/add/observable/timer';
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {Message} from './message';
import {SongInfo} from './song-info';
import {User} from './user';

@Injectable()
export class PianodService {
  public responseTimeout: number = 2000;
  public connected$: Observable<boolean>;
  public error$: Observable<string>;
  public playback$: Observable<string>;
  public song$: Observable<SongInfo>;
  public user$: Observable<User>;
  public songInfo: SongInfo = new SongInfo();
  public userInfo: User = new User();
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
  public connect(url) {
    const self = this;
    this.socket = new WebSocket(url);
    this.socket.onopen = function() { self.connected.next(true); };
    this.socket.onclose = function() { self.connected.next(false); };
    this.listen();
  };

  // Note: i expected i would have to limit concurrency
  // but everthing seems to work
  // TODO WRITE TESTS FOR THIS!
  // would be nice if i could mock socket response
  public async sendCmd(cmd) {
    // this.socket.send(cmd);

    let self = this;
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(cmd);

      let results = await this.getResponse(this.socket);
    } else {
      console.log('NOT CONNECTED TO SOCKET');
    }
  };

  // listen for ALL incoming socket messaged and update pianod
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
  // TODO handle muitiple data packets
  // see  documentation/protocal.md for pianod dataRequest protocol
  private getResponse(socket) {
    const end$ = new Subject();
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
            dataRequest = true;
          } else if (msg.code === 200) { // success
            end$.next(msg);
            end$.complete();
          } else if (msg.code === 204) { // end of data request
            data.push(dataPacket);
            end$.next(data);
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

    if (msg.code === 108) {
      // no station selected
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
