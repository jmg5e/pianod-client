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

  it('song clearSong() should clear song data and return empty object',
     inject([ Song ], (song: Song) => {
       song.update({Artist : 'Taylor Swift'});
       expect(song.data.Artist).toBeDefined();
       const songData = song.clearSong();
       expect(songData.Artist).toBeUndefined();
       expect(song.data.Artist).toBeUndefined();
     }));

  it('song played,total and remainingTime should be 0 if not set',
     inject([ Song ], (song: Song) => {
       expect(song.playedTime.minutes).toEqual(0);
       expect(song.playedTime.seconds).toEqual(0);

       expect(song.remainingTime.minutes).toEqual(0);
       expect(song.remainingTime.seconds).toEqual(0);

       expect(song.totalTime.minutes).toEqual(0);
       expect(song.totalTime.seconds).toEqual(0);
     }));

  it('song setTime should get and set correct values from string',
     inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       song.setTime(timeMessage);
       expect(song.playedTime.minutes).toEqual(1);
       expect(song.playedTime.seconds).toEqual(46);

       expect(song.totalTime.minutes).toEqual(4);
       expect(song.totalTime.seconds).toEqual(9);

       expect(song.remainingTime.minutes).toEqual(2);
       expect(song.remainingTime.seconds).toEqual(22);
     }));

  it('getSongRemainingTime should emit value of 0 time if not set',
     fakeAsync(inject([ Song ], (song: Song) => {
       let remainingTime;

       song.getSongRemainingTime().subscribe(newRemaingTime => {
         remainingTime = newRemaingTime;
         expect(newRemaingTime).toEqual('0:00');
       });

       song.startTimer();
       tick(60000);
       expect(remainingTime).toEqual('0:00');
       discardPeriodicTasks();
     })));

  it('song startTimer should decrement remainingTime',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let remainingTime;
       song.setTime(timeMessage);
       song.startTimer();

       song.getSongRemainingTime().skip(1).subscribe(newRemainingTime => {
         remainingTime = newRemainingTime;
       });

       tick(3000);
       expect(remainingTime).toEqual('2:19');
       discardPeriodicTasks();
     })));

  it('song remainingTime should be correct after a given amount of time',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let remainingTime = {};
       song.setTime(timeMessage);
       song.getSongRemainingTime().subscribe(
           newRemaingTime => { remainingTime = newRemaingTime; });

       song.startTimer();
       tick(22000);
       expect(remainingTime).toEqual('2:00');
       tick(68000); // 90 seconds or 1 minute 30 seconds passed
       expect(remainingTime).toEqual('0:52');
       discardPeriodicTasks();
     })));

  it('stopTimer should stop updating remainingTime',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let remainingTime = {};
       song.setTime(timeMessage);
       song.getSongRemainingTime().subscribe(
           newRemaingTime => { remainingTime = newRemaingTime; });

       song.startTimer();
       tick(22000);
       expect(remainingTime).toEqual('2:00');
       song.stopTimer();
       tick(68000); // 90 seconds or 1 minute 30 seconds passed
       expect(remainingTime).toEqual('2:00');
       discardPeriodicTasks();
     })));

  it('RemainingTime should be correct after a given amount of time with muiltiple starts and stops',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let remainingTime = {};
       song.setTime(timeMessage);
       song.getSongRemainingTime().subscribe(
           newRemaingTime => { remainingTime = newRemaingTime; });

       song.startTimer();
       tick(22000);
       song.stopTimer();
       tick(12000);
       expect(remainingTime).toEqual('2:00');
       song.startTimer();
       tick(60000);
       expect(remainingTime).toEqual('1:00');
       song.stopTimer();
       tick(19000);
       expect(remainingTime).toEqual('1:00');
       song.startTimer();
       tick(58000);
       expect(remainingTime).toEqual('0:02');
       discardPeriodicTasks();
     })));

  it('remainingTime should never be negative',
     fakeAsync(inject([ Song ], (song: Song) => {
       const timeMessage = '101 01:46/04:09/-02:22 Playing';
       let remainingTime = {};
       song.setTime(timeMessage);
       song.getSongRemainingTime().subscribe(
           newRemaingTime => { remainingTime = newRemaingTime; });
       song.startTimer();
       tick(222000);
       tick(60000);
       expect(remainingTime).toEqual('0:00');
       discardPeriodicTasks();
     })));

});
