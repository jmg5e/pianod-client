import 'rxjs/Rx';

import {async, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {ReplaySubject} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {TestScheduler} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {User} from './models/user';
import {PianodService} from './pianod.service';

// const testServer = global.config.mockPianod;
const mockPianod = {
  port : 4201,
  host : 'localhost'
};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

describe('PianodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers : [ PianodService ]});
  });

  beforeEach(async(inject([ PianodService ], (s: PianodService) => {
    this.service = s;

    this.service.connect(mockPianod.host, mockPianod.port).then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
      expect(this.service.connectionInfo)
          .toEqual({host : mockPianod.host, port : mockPianod.port});
    });
  })));

  it('should inject PianodService',
     () => { expect(this.service).toBeTruthy(); });

  it('pianod service should connect to mock pianod socket', (done) => {

    const subscription =
        this.service.getConnectionState().take(1).subscribe(connectedState => {
          expect(connectedState).toEqual(true);
        }, e => console.log('Error: %s', e), () => done());
  });

  it('disconnect should update connected state', (done) => {
    const subscription =
        this.service.getConnectionState().take(2).toArray().subscribe(
            connectedStateSequence => {
              expect(connectedStateSequence).toEqual([ true, false ]);
            },
            e => console.log('Error: %s', e), () => done());
    this.service.disconnect();
  });

  it('playback should initially be set to PAUSED', (done) => {

    const subscription =
        this.service.getPlayback().take(1).subscribe(playback => {
          expect(playback).toEqual('PAUSED');
        }, e => console.log('Error: %s', e), () => done());
  });
  //
  it('should initiallly get user with only listener privilege', (done) => {

    const subscription = this.service.getUser().take(1).subscribe(user => {

      expect(user.privileges).toEqual({
        listener : true,
        admin : false,
        owner : false,
        service : false,
        influence : false,
        tuner : false
      });
    }, e => console.log('Error: %s', e), () => done());
  });
  //
  it('login with invalid credientials should response with error', (done) => {
    this.service.sendCmd('user userName invalidPass').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Invalid login or password');
      done();
    });
  });
  //
  xit('login with valid credientials should send correct response and new user',
      (done) => {

        this.service.getUser().take(2).toArray().subscribe(user => {

          // expect(user[0].privileges).toEqual({
          //   listener : true,
          //   admin : false,
          //   owner : false,
          //   service : false,
          //   influence : false,
          //   tuner : false
          // });

          expect(user[1].privileges).toEqual({
            listener : true,
            admin : true,
            owner : true,
            service : true,
            influence : true,
            tuner : true
          });
        }, e => console.log('Error: %s', e), () => done());

        this.service.sendCmd('user userName validPass').then(response => {
          expect(response.error).toBeFalsy();
        });
      });

  it('get response should eventually timeout with error', (done) => {
    this.service.sendCmd('null').then(response => {
      // console.log(response);
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

    const subscription = this.service.getPlayback().take(2).toArray().subscribe(
        playbackSequence => {

          expect(playbackSequence).toEqual([ 'PAUSED', 'PLAYING' ]);

        },
        e => console.log('Error: %s', e), () => done());

    this.service.sendCmd('play').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });
  //
  it('command pause should set playback to PAUSED', (done) => {

    // TODO should probably not update state unless changed
    const subscription = this.service.getPlayback().take(2).toArray().subscribe(
        playbackSequence => {

          expect(playbackSequence).toEqual([ 'PAUSED', 'PAUSED' ]);

        },
        e => console.log('Error: %s', e), () => done());

    this.service.sendCmd('pause').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command stop should set playback to STOPPED', (done) => {

    const subscription = this.service.getPlayback().take(2).toArray().subscribe(
        playbackSequence => {

          expect(playbackSequence).toEqual([ 'PAUSED', 'STOPPED' ]);

        },
        e => console.log('Error: %s', e), () => done());

    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });
});
