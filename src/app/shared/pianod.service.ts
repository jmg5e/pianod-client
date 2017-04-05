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
  private song: Song = new Song();
  private playlists = new Subject<any>();
  private sources = new Subject<any>();
  private queueList = new Subject<any>();
  private selectedPlaylist = new Subject<string>();
  private songInfo = new BehaviorSubject<SongInfo>(this.song.data);
  private userInfo: User = new User();
  private user = new BehaviorSubject<User>(this.userInfo);
  private socket: WebSocket;
  private q;

  constructor() {
    // limit concurrency of socket commands to 1
    // using libarary async js queue to solve this problem
    this.q = Async.queue((cmd, done) => {
      this.doSendCmd(cmd).then(res => done(res)).catch(err => done(err));
    }, 1);
  }

  public getQueueList() { return this.queueList.asObservable(); }
  public getSources() { return this.sources.asObservable(); }
  public getPlaylists() { return this.playlists.asObservable(); }
  public getConnectionState() { return this.connected.asObservable(); }
  public getPlayback() { return this.playback.asObservable(); }
  public getErrors() { return this.error.asObservable(); }
  public getSong() { return this.songInfo.asObservable(); }

  public getUser(): Observable<User> { return this.user.asObservable(); }
  public getSelectedPlaylist() { return this.selectedPlaylist.asObservable(); }
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
    if (!response.error && response.msg === 'Success') {
      this.connectionInfo = {host : host, port : port};
      this.connected.next(true);
      // this.updateSources();

      this.updatePlaylists();
      this.updateQueueList();
      // this.user.next(new User());
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

  public updatePlaylists() {
    // get list of stations
    this.sendCmd('PLAYLIST LIST').then(response => {
      if (!response.error && response.data) {
        const playlists =
            response.data
                .map((playlist) => playlist.reduce(
                         (obj, item) => Object.assign(obj, item), {}))
                .map(playlist => {
                  // rename Playlist property to Name
                  if (playlist.Playlist) {
                    Object.assign(playlist, {Name : playlist.Playlist});
                    delete playlist.Playlist;
                  }
                  return playlist;
                });
        this.playlists.next(playlists);
      }
    });
    // const playLists = response.data.reduce(
    //     (results, dataPacket) => dataPacket.map(station =>
    //     station.Playlist),
    //     []);
    //
    // return playLists;
  }

  private updateQueueList() {

    // let sources = [];
    this.sendCmd('QUEUE LIST').then(response => {
      if (!response.error && response.data) {
        const queueList = response.data.map(
            (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
        this.queueList.next(queueList);
        return queueList;
      }
    });
  }

  // private async updateSources() {
  //
  //   let sourceList = [];
  //   const response = await this.sendCmd('SOURCE LIST');
  //   if (!response.error && response.data) {
  //     sourceList =
  //         response.data.map((playlist) => playlist.reduce(
  //                               (obj, item) => Object.assign(obj, item),
  //                               {}));
  //   }
  //
  //   this.sources.next(sourceList);
  //   return sourceList;
  // }

  public async search(searchTerm, category, source) {
    const response =
        await this.sendCmd(`FIND SUGGESTION WHERE artist=\"${searchTerm}\"`);
    // map data packet of seed array into an object
    const results = response.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return results;
  }

  public getSongRemainingTime(): Observable<any> {
    return this.song.getSongRemainingTime();
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

    this.socket.onclose = () => {
      this.connectionInfo = undefined;
      this.connected.next(false);
      this.userInfo = new User();
      this.user.next(this.userInfo);
    };

    this.handleRuntime();
  }

  // pass message to update pianod state unless message is an error or is a
  // data
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
    let dataRequest = false;
    let dataPacket = [];
    const data = [];
    const msgs = [];

    const response$ = new Subject<any>();
    // observe response from socket messages
    // const pianodMsgs$ = Observable.fromEvent(this.socket, 'message');

    // this works i think but breaks unit tests
    const pianodMsgs$ = Observable.fromEvent(this.socket, 'message')
                            .timeout(this.responseTimeout);
    // , Promise.resolve({error : true, msg : 'TimeoutError'});

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

  public async getPlaylistSongList(playlistId) {
    const response =
        await this.sendCmd(`playlist song list where id=${playlistId}`);

    return response.data;
  }

  public async getPlaylistSeeds(playlistId) {
    const response = await this.sendCmd(`seed list playlist id ${playlistId}`);
    const seeds: Array<Seed> = response.data.map(
        (seed) => seed.reduce((obj, item) => Object.assign(obj, item), {}));
    return seeds;
  }

  // update pianod state from a message
  private updatePianod(msg: Message) {
    if (msg.data) {
      this.song.update(msg.data);
      this.songInfo.next(this.song.data);
    }

    if (msg.code >= 1 && msg.code <= 7) {
      if (msg.code === 1) {
        this.song.setTime(msg.content);
      }
      this.updatePlayback(msg);
    }
    // if (msg.code === 24) {
    //   // 024 Available sources have changed: ready for Source 3
    //   this.updateSources();
    // }
    if (msg.code === 26) {
      // this.updateQueueList().subscribe(queueList =>
      //                                      this.queueList.next(queueList));
      console.log('queue changed');
      // 026 QueueChanged
    }
    // user logged in
    if (msg.code === 136) {
      this.userInfo.update(msg);
      this.user.next(this.userInfo);
      // this.updateSources();
    }
  }

  private updatePlayback(msg: Message) {
    switch (msg.code) {
    case 1:
      this.playback.next('PLAYING');
      this.song.startTimer();
      break;
    case 2:
      this.playback.next('PAUSED');
      this.song.stopTimer();
      break;
    case 7:
      this.playback.next('STOPPED');
      this.song.clearTime();
      // clear song info
      this.songInfo.next(this.song.clearSong());
      break;
    };
  }
}

export interface Response {
  error: boolean;
  msg: Message;
  msgs: Array<any>;
  data: Array<any>;
}
