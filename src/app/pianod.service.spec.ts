/* tslint:disable:no-unused-variable */
import 'rxjs/Rx';

import {async, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs/Rx';
import {ReplaySubject} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {TestScheduler} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

import {PianodService} from './pianod.service';

const testServer = global.config.testServer;
const socketUrl = `ws://localhost:${testServer.port}/pianod`;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

describe('PianodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers : [ PianodService ]});
  });
  beforeEach(async(inject([ PianodService ], (s: PianodService) => {
    this.service = s;

    this.service.connect(socketUrl).then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Connected');
    });
  })));

  it('should inject PianodService',
     () => { expect(this.service).toBeTruthy(); });

  it('pianod service should connect to mock pianod socket', (done) => {
    let connectedResults = new ReplaySubject();
    this.service.connected$.subscribe(connectedState => {
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
    let connectedResults = new ReplaySubject();
    this.service.connected$.subscribe(connectedState => {
      connectedResults.next(connectedState);
      if (connectedState === false) {
        connectedResults.complete();
      }
    });

    connectedResults.toArray()
        .toPromise()
        .then(connectedState => {
          expect(connectedState).toEqual([ true, false ]);
          done();
        })
        .catch(err => console.log(err));
    this.service.disconnect();
  });

  it('playback should initially be set to PAUSED', (done) => {
    let playbackResults = new ReplaySubject();
    this.service.playback$.subscribe(playback => {
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

  it('current station should initially be set to station1', (done) => {
    let currentStationResults = new ReplaySubject();
    this.service.currentStation$.subscribe(station => {
      currentStationResults.next(station);
      currentStationResults.complete();
    });

    currentStationResults.toPromise()
        .then(station => {
          expect(station).toEqual('station1');
          done();
        })
        .catch(err => console.log(err));
  });

  it('should initiallly get empty user that is not loggedIn', (done) => {
    let userResults = new ReplaySubject();
    this.service.user$.subscribe(user => {
      userResults.next(user);
      userResults.complete();
    });

    userResults.toPromise()
        .then(user => {
          expect(user.loggedIn).toBeFalsy();
          expect(user.privileges).toEqual({
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
    this.service.sendCmd('user invalid').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Invalid login or password');
      done();
    });
  });

  it('login with valid credientials should send correct response and new user',
     (done) => {

       let userResults = new ReplaySubject();
       this.service.user$.skip(1).subscribe(user => {
         userResults.next(user);
         userResults.complete();
       });

       userResults.toPromise()
           .then(user => {
             expect(user.loggedIn).toBeTruthy();
             expect(user.privileges).toEqual({
               admin : true,
               owner : true,
               service : true,
               influence : true,
               tuner : true
             });
             done();
           })
           .catch(err => console.log(err));
       this.service.sendCmd('user valid').then(response => {
         expect(response.error).toBeFalsy();
       });
     });

  it('should get correct list of stations after loggin', (done) => {
      const expectedStations = [{
            Name : 'station1',
            Seeds : [{
                ID: 'a01'
                Artist: 'Taylor Swift',
                Rating: 'artistseed'
            },
            {
                ID: 'a02',
                Title: 'Thriller',
                Rating: 'artistseed'
            }]},
            {
            Name: 'station2',
            Seeds : [
            {
              ID: 'b01',
              Genre: 'Medieval Rock',
              Rating: 'artistseed'}
          }];
                let stationResults = new ReplaySubject();
                this.service.stations$.subscribe(stations => {
                  stationResults.next(stations);
                  stationResults.complete();
                });

                stationResults.toPromise()
                    .then(stations => {
                      expect(stations.length).toEqual(2);
                      expect(stations).toEqual(expectedStations);
                      done();
                    })
                    .catch(err => console.log(err));
                this.service.sendCmd('user valid').then(response => {
                  expect(response.error).toBeFalsy();
                });
  });

  it('should get correct mixlist on login', (done) => {
    let mixListResults = new ReplaySubject();
    this.service.mixList$.subscribe(mixList => {
      mixListResults.next(mixList);
      mixListResults.complete();
    });

    mixListResults.toPromise()
        .then(mixList => {
             expect(mixList).toEqual([{Name : 'station1'});
             done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('user valid').then(response => {
      expect(response.error).toBeFalsy();
    });
  });

  // it('get response should eventually timeout with error', (done) => {
  //   this.service.sendCmd('null').then(response => {
  //     expect(response.error).toBeTruthy();
  //     expect(response.msg).toEqual('TimeoutError');
  //     done();
  //   });
  // });

  it('invalid command should respond with error', (done) => {
    this.service.sendCmd('blah').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Bad command blah');
      done();
    });
  });

  it('command play should set playback to PLAYING', (done) => {
    let playbackResults = new ReplaySubject();
    this.service.playback$.take(2).subscribe(playback => {
      playbackResults.next(playback);
      if (playback === 'PLAYING') {
        playbackResults.complete();
      }
    });

    playbackResults.toArray()
        .toPromise()
        .then(playback => {
          expect(playback).toEqual([ 'PAUSED', 'PLAYING' ]);
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('play').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command pause should set playback to PAUSED', (done) => {
    let playbackResults = new ReplaySubject();
    this.service.playback$.skip(1).subscribe(playback => {
      playbackResults.next(playback);
      if (playback === 'PAUSED') {
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
    let playbackResults = new ReplaySubject();
    this.service.playback$.subscribe(playback => {
      playbackResults.next(playback);
      if (playback === 'STOPPED') {
        playbackResults.complete();
      }
    });

    playbackResults.toArray()
        .toPromise()
        .then(playback => {
          expect(playback).toEqual([ 'PAUSED', 'STOPPED' ]);
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command stop should unset currentStation', (done) => {
    let currentStationResults = new ReplaySubject();
    this.service.currentStation$.skip(1).subscribe(station => {
      currentStationResults.next(station);
      currentStationResults.complete();
    });

    currentStationResults.toPromise()
        .then(station => {
          expect(station).toEqual('');
          done();
        })
        .catch(err => console.log(err));
    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });
});

// describe('PianodService non async', () => {
//   beforeEach(() => {
//     TestBed.configureTestingModule({providers : [ PianodService ]});
//   });
//   beforeEach(inject([ PianodService ], (s: PianodService) => {
//     this.service = s;
//
//     this.service.connect(socketUrl).then(response => {
//       expect(response.error).toBeFalsy();
//       expect(response.msg).toEqual('Connected');
//     });
//   }));
//
//   it('get response should eventually timeout with error', (done) => {
//     this.service.sendCmd('null').then(response => {
//       expect(response.error).toBeTruthy();
//       expect(response.msg).toEqual('TimeoutError');
//       done();
//     });
//   });
// });
