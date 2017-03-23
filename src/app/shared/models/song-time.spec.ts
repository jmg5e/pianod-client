import {inject, TestBed} from '@angular/core/testing';

import {SongTime} from './song-time';

describe('SongTime', function() {
  it('should construct Time', () => {
    const testTime = new SongTime();

    expect(testTime.minutes).toEqual(0);
    expect(testTime.seconds).toEqual(0);
  });

  it('should construct Time with optional parameters', () => {
    const testTime = new SongTime(3, 23);
    expect(testTime.minutes).toEqual(3);
    expect(testTime.seconds).toEqual(23);
  });

  it('toString should output time in correct format', () => {
    expect(new SongTime(1, 23).toString()).toEqual('1:23');
    expect(new SongTime(1, 2).toString()).toEqual('1:02');
  });

  it('toSeconds should return correct total time in seconds',
     () => { expect(new SongTime(1, 23).toSeconds()).toEqual(83); });

  it('setTimeFromSeconds should set correct time', () => {
    const testTime = new SongTime();
    testTime.setTimeFromSeconds(183);
    expect(testTime.minutes).toEqual(3);
    expect(testTime.seconds).toEqual(3);
  });
});
