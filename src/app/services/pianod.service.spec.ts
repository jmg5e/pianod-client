import 'rxjs/Rx'; // really only need take and toArray operators

import {async, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/Rx';
import {PianodService} from './pianod.service';

// const testServer = global.config.testServer;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
const mockPianod = {
  'port': 4201,
  'host': 'localhost'
};

describe('PianodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [PianodService]});
  });

  beforeEach(async(inject([PianodService], (s: PianodService) => {
    this.service = s;

    return this.service.connect(mockPianod.host, mockPianod.port).then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Connected');
      expect(this.service.connectionInfo).toEqual({host: mockPianod.host, port: mockPianod.port});
    });
  })));

  it('should inject PianodService', () => {
    expect(this.service).toBeTruthy();
  });

  it('pianod service should connect to mock pianod socket', (done) => {
    this.service.getConnectionState().take(1).subscribe(connectedState => {
      expect(connectedState).toEqual(true);
    }, e => console.log('Error: %s', e), () => done());

  });

  it('disconnect should update connected state', (done) => {
    this.service.getConnectionState().take(2).toArray().subscribe(connectedState => {
      expect(connectedState).toEqual([true, false]);
      expect(this.service.connectionInfo).toBeUndefined();
    }, e => console.log('Error: %s', e), () => done());

    this.service.disconnect();
  });

  it('playback should initially be set to PAUSED', (done) => {
    this.service.getPlayback().take(1).subscribe(playback => {
      expect(playback).toEqual('PAUSED');
    }, e => console.log('Error: %s', e), () => done());

  });

  it('current station should initially be set to station1', (done) => {
    this.service.getCurrentStation().take(1).subscribe(station => {
      expect(station).toEqual('station1');
    }, e => console.log('Error: %s', e), () => done());

  });

  it('should initiallly get empty user with no privileges', (done) => {
    this.service.getUser().take(1).subscribe(user => {

      expect(user.name).toBeUndefined();
      expect(user.privileges)
          .toEqual({admin: false, owner: false, service: false, influence: false, tuner: false});
    }, err => console.log(err), () => done());

  });

  it('login with invalid credientials should response with error', (done) => {
    this.service.sendCmd('user userName invalidPass').then(response => {
      expect(response.error).toBeTruthy();
      expect(response.msg).toEqual('Invalid login or password');
      done();
    });
  });

  it('login with valid credientials should send correct response and new user', (done) => {

    this.service.getUser().take(2).toArray().subscribe(users => {
      expect(users[0].name).toBeUndefined();
      expect(users[0].privileges)
          .toEqual({admin: false, owner: false, service: false, influence: false, tuner: false});

      expect(users[1].name).toEqual('userName');
      expect(users[1].privileges)
          .toEqual({admin: true, owner: true, service: true, influence: true, tuner: true});
    }, err => console.log(err), () => done());

    this.service.login('userName', 'validPass').then(response => {
      expect(response.error).toBeFalsy();
    });
  });

  it('should get correct list of stations after loggin', (done) => {
    this.service.getStations().skip(1).take(1).subscribe(stations => {

      expect(stations.length).toEqual(2);
      expect(stations).toEqual(['station1', 'station2']);
    }, err => console.log(err), () => done());

    this.service.sendCmd('user userName validPass').then(response => {
      expect(response.error).toBeFalsy();
    });
  });

  it('getStationSeeds should return correct results', async(done) => {
    const station1Seeds = await this.service.getStationSeeds('station1');
    expect(station1Seeds).toEqual([
      {ID: 'a01', Artist: 'Taylor Swift', Rating: 'artistseed'},
      {ID: 'a02', Title: 'Thriller', Rating: 'artistseed'}
    ]);

    const station2Seeds = await this.service.getStationSeeds('station2');
    expect(station2Seeds).toEqual([{ID: 'b01', Genre: 'Medieval Rock', Rating: 'artistseed'}]);
    done();
  });

  it('should get correct mixlist on login', (done) => {
    this.service.getMixList().skip(1).take(1).subscribe(mixList => {
      expect(mixList).toEqual(['station1']);
    }, err => console.log(err), () => done());

    this.service.sendCmd('user userName validPass').then(response => {
      expect(response.error).toBeFalsy();
    });
  });

  it('command response should eventually timeout with error', (done) => {
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
    this.service.getPlayback().take(2).toArray().subscribe(playback => {
      expect(playback).toEqual(['PAUSED', 'PLAYING']);
    }, err => console.log(err), () => done());

    this.service.sendCmd('play').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command pause should set playback to PAUSED', async(done) => {
    this.service.getPlayback().take(3).toArray().subscribe(playback => {
      expect(playback).toEqual(['PAUSED', 'PLAYING', 'PAUSED']);
    }, err => console.log(err), () => done());

    await this.service.sendCmd('play').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
    await this.service.sendCmd('pause').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command stop should set playback to STOPPED', (done) => {
    this.service.getPlayback().take(2).toArray().subscribe(playback => {
      expect(playback).toEqual(['PAUSED', 'STOPPED']);
    }, err => console.log(err), () => done());

    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });

  it('command stop should unset currentStation', (done) => {
    this.service.getCurrentStation().take(2).toArray().subscribe(currentStation => {
      expect(currentStation).toEqual(['station1', '']);
    }, err => console.log(err), () => done());

    this.service.sendCmd('stop').then(response => {
      expect(response.error).toBeFalsy();
      expect(response.msg).toEqual('Success');
    });
  });
});
