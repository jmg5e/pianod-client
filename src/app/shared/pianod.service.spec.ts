import 'rxjs/Rx';

import {async, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {ReplaySubject} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {TestScheduler} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

import {PianodService} from './pianod.service';

const testServer = global.config.testServer;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

describe('PianodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers : [ PianodService ]});
  });

  beforeEach(async(inject([ PianodService ], (s: PianodService) => {
    this.service = s;

    this.service.connect(testServer.host, testServer.port).then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
      expect(this.service.connectionInfo)
          .toEqual({host : testServer.host, port : testServer.port});
    });
  })));

  it('should inject PianodService',
     () => { expect(this.service).toBeTruthy(); });

  it('pianod service should connect to mock pianod socket', (done) => {
    const connectedResults = new ReplaySubject();
    this.service.getConnectionState().subscribe(connectedState => {
      connectedResults.next(connectedState);
      connectedResults.complete();
    });

    connectedResults.toPromise()
        .then(connectedState => {
          expect(connectedState).toEqual(true);
          done();
        })
        .catch(err => console.log(err));
  });

  it('disconnect should update connected state', (done) => {
    const connectedResults = new ReplaySubject();
    let sequenceLimit = 2;
    this.service.getConnectionState().subscribe(connectedState => {
      connectedResults.next(connectedState);
      sequenceLimit--;
      if (sequenceLimit <= 0) {
        connectedResults.complete();
      }
    });

    connectedResults.toArray()
        .toPromise()
        .then(connectedStateSequence => {
          expect(connectedStateSequence).toEqual([ true, false ]);
          expect(this.service.connectionInfo).toBeUndefined();
          done();
        })
        .catch(err => console.log(err));
    this.service.disconnect();
  });

  it('playback should initially be set to PAUSED', (done) => {
    const playbackResults = new ReplaySubject();
    this.service.getPlayback().subscribe(playback => {
      playbackResults.next(playback);
      playbackResults.complete();
    });

    playbackResults.toPromise()
        .then(playback => {
          expect(playback).toEqual('PAUSED');
          done();
        })
        .catch(err => console.log(err));
  });

  it('should initiallly get user with only listener privilege', (done) => {
    const userResults = new ReplaySubject();
    this.service.getUser().subscribe(user => {
      userResults.next(user);
      userResults.complete();
    });

    userResults.toPromise()
        .then(user => {
          expect(user.privileges).toEqual({
            listener : true,
            admin : false,
            owner : false,
            service : false,
            influence : false,
            tuner : false
          });
          done();
        })
        .catch(err => console.log(err));
  });

  it('login with invalid credientials should response with error', (done) => {
    this.service.sendCmd('user userName invalidPass').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Invalid login or password');
      done();
    });
  });

  xit('login with valid credientials should send correct response and new user',
      (done) => {

        const userResults = new ReplaySubject();
        let sequenceLimit = 2;
        this.service.getUser().subscribe(user => {
          userResults.next(user);
          sequenceLimit--;
          if (sequenceLimit <= 0) {
            userResults.complete();
          }
        });

        userResults.toArray()
            .toPromise()
            .then(users => {
              expect(users[0].privileges).toEqual({
                listener : true,
                admin : false,
                owner : false,
                service : false,
                influence : false,
                tuner : false
              });
              expect(users[1].privileges).toEqual({
                listener : true,
                admin : true,
                owner : true,
                service : true,
                influence : true,
                tuner : true
              });
              done();
            })
            .catch(err => console.log(err));
        this.service.sendCmd('user userName validPass').then(response => {
          expect(response.error).toBeFalsy();
        });
      });

  // rxjs timeout throws error when async injecting pianod service
  xit('get response should eventually timeout with error', (done) => {
    this.service.sendCmd('null').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('TimeoutError');
      done();
    });
  });

  it('invalid command should respond with error', (done) => {
    this.service.sendCmd('blah').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Bad command blah');
      done();
    });
  });

  it('command play should set playback to PLAYING', (done) => {
    const playbackResults = new ReplaySubject();
    let sequenceLimit = 2;
    this.service.getPlayback().subscribe(playback => {
      playbackResults.next(playback);
      sequenceLimit--;
      if (sequenceLimit <= 0) {
        playbackResults.complete();
      }
    });

    playbackResults.toArray()
        .toPromise()
        .then(playbackSequence => {
          expect(playbackSequence).toEqual([ 'PAUSED', 'PLAYING' ]);
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('play').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command pause should set playback to PAUSED', (done) => {
    const playbackResults = new ReplaySubject();
    let sequenceLimit = 2;
    this.service.getPlayback().subscribe(playback => {
      playbackResults.next(playback);
      sequenceLimit--;
      if (sequenceLimit <= 0) {
        playbackResults.complete();
      }
    });

    playbackResults.toPromise()
        .then(playback => {
          expect(playback).toEqual('PAUSED');
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('pause').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command stop should set playback to STOPPED', (done) => {
    const playbackResults = new ReplaySubject();
    let sequenceLimit = 2;
    this.service.getPlayback().subscribe(playback => {
      playbackResults.next(playback);
      sequenceLimit--;
      if (sequenceLimit <= 0) {

        playbackResults.complete();
      }
    });

    playbackResults.toArray()
        .toPromise()
        .then(playbackSequence => {
          expect(playbackSequence).toEqual([ 'PAUSED', 'STOPPED' ]);
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

});
