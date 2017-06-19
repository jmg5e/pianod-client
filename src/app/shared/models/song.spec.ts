import 'rxjs/Rx';
import {
  async,
  discardPeriodicTasks,
  fakeAsync,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';

import {Song} from './song';

describe('Song', () => {
  beforeEach(() => { TestBed.configureTestingModule({providers : [ Song ]}); });

  it('song update should set correct property',
     inject([ Song ], (song: Song) => {
       song.update({Artist : 'Taylor Swift'});
       expect(song.data.Artist).toBeDefined();
       expect(song.data.Artist).toEqual('Taylor Swift');
     }));

  it('clearSong() should clear song data and return empty object',
     inject([ Song ], (song: Song) => {
       song.update({Artist : 'Taylor Swift'});
       expect(song.data.Artist).toBeDefined();
       const songData = song.clearSong();
       expect(songData.Artist).toBeUndefined();
       expect(song.data.Artist).toBeUndefined();
     }));

  it('playedTime,totalTime and remainingTime should be 0 if not set',
     inject([ Song ], (song: Song) => {
       expect(song.remainingTime.minutes).toEqual(0);
       expect(song.remainingTime.seconds).toEqual(0);

       expect(song.playedTime.minutes).toEqual(0);
       expect(song.playedTime.seconds).toEqual(0);

       expect(song.totalTime.minutes).toEqual(0);
       expect(song.totalTime.seconds).toEqual(0);
     }));

  it('setTime should get and set correct values from string',
     inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       song.setTime(timeMessage);
       expect(song.remainingTime.minutes).toEqual(2);
       expect(song.remainingTime.seconds).toEqual(22);

       expect(song.totalTime.minutes).toEqual(4);
       expect(song.totalTime.seconds).toEqual(9);

       expect(song.playedTime.minutes).toEqual(1);
       expect(song.playedTime.seconds).toEqual(46);
     }));

  it('getSongPlayedTime should emit value of 0 time if not set',
     fakeAsync(inject([ Song ], (song: Song) => {

       let playedTime;
       song.getSongPlayedTime().subscribe(newPlayedTime => {
        playedTime = newPlayedTime.toString();
         expect(playedTime).toEqual('0:00');
       });
       song.startTimer();
       tick(60000);
       expect(playedTime).toEqual('0:00');
       discardPeriodicTasks();
     })));

  it('startTimer() should increment playedTime',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let playedTime;
       song.setTime(timeMessage);
       song.startTimer();

       song.getSongPlayedTime().skip(1).subscribe(newPlayedTime => {
        playedTime = newPlayedTime.toString();
       });

       tick(3000);
       expect(playedTime).toEqual('1:49');
       discardPeriodicTasks();
     })));

  it('song playedTime should be correct after a given amount of time',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let playedTime = {};
       song.setTime(timeMessage);
       song.getSongPlayedTime().subscribe(
           newPlayedTime => { playedTime = newPlayedTime; });

       song.startTimer();
       tick(15000); // 15 seconds
       expect(playedTime.toString()).toEqual('2:01');
       tick(90000); // 90 seconds
       expect(playedTime.toString()).toEqual('3:31');
       discardPeriodicTasks();
     })));

  it('stopTimer should stop updating playedTime',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let playedTime; // = {};
       song.setTime(timeMessage);
       song.getSongPlayedTime().subscribe(
           newPlayedTime => { playedTime = newPlayedTime; });

       song.startTimer();
       tick(15000);
       expect(playedTime.toString()).toEqual('2:01');
       song.stopTimer();
       tick(90000); // 90 seconds
       expect(playedTime.toString()).toEqual('2:01');
       discardPeriodicTasks();
     })));

  it('playedTime should be correct after a given amount of time with muiltiple starts and stops',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let playedTime = {};
       song.setTime(timeMessage);
       song.getSongPlayedTime().subscribe(
           newPlayedTime => { playedTime = newPlayedTime; });

       song.startTimer();
       tick(16000);
       song.stopTimer();
       tick(12000);
       expect(playedTime.toString()).toEqual('2:02');
       song.startTimer();
       tick(60000);
       expect(playedTime.toString()).toEqual('3:02');
       song.stopTimer();
       tick(19000);
       expect(playedTime.toString()).toEqual('3:02');
       song.startTimer();
       tick(58000);
       expect(playedTime.toString()).toEqual('4:00');
       discardPeriodicTasks();
     })));

  xit('playedTime should never be greater than totalTime',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let playedTime = {};
       song.setTime(timeMessage);
       song.getSongPlayedTime().subscribe(
           newPlayedTime => { playedTime = newPlayedTime; });
       song.startTimer();
       tick(222000);
       tick(60000);
       expect(playedTime.toString()).toEqual('4:09');
       discardPeriodicTasks();
     })));

});
