import 'rxjs/add/observable/timer';
// import 'rxjs/add/observable/asObservable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export class SongInfo {
  ID: string;
  Station: string;
  Artist: string;
  Album: string;
  Title: string;
  CoverArt: string;
  SeeAlso: string;
  UserRating: string;
  SelectedStation: string;
  Rating: string;
  protected totalTime: SongTime;
  protected playedTime: SongTime;
  protected remainingTime: SongTime;
  private remainingTime$: Subject<SongTime> = new Subject();
  private isPlaying = false;

  constructor() {
    this.totalTime = {minutes : 0, seconds : 0};
    this.playedTime = {minutes : 0, seconds : 0};
    this.remainingTime = {minutes : 0, seconds : 0};
  }

  public update(data) { Object.assign(this, data); }
  public getSongRemainingTime(): Observable<SongTime> {
    return this.remainingTime$.asObservable();
  }
  public startTimer() { this.isPlaying = true; }
  public stopTimer() { this.isPlaying = false; }

  // set played, remaining and total time from string
  // string should be the following format
  // played/total/remaining
  // Ex: 00:57/06:30/-05:32 Playing
  public setTime(timeMsg: string) {
    const timeMatch = timeMsg.match(new RegExp(
        '([0-9]{2})\\:([0-9]{2})/([0-9]{2})\\:([0-9]{2})/\\-([0-9]{2})\\:([0-9]{2})',
        'i'));
    if (timeMatch !== null && timeMatch.length === 7) {
      this.playedTime = {
        minutes : parseInt(timeMatch[1], 10),
        seconds : parseInt(timeMatch[2], 10)
      };
      this.totalTime = {
        minutes : parseInt(timeMatch[3], 10),
        seconds : parseInt(timeMatch[4], 10)
      };
      this.remainingTime = {
        minutes : parseInt(timeMatch[5], 10),
        seconds : parseInt(timeMatch[6], 10)
      };

      const remaingTimeInSeconds =
          this.remainingTime.minutes * 60 + this.remainingTime.seconds;

      Observable.timer(0, 1000)
          .takeWhile(() => (this.isPlaying && remaingTimeInSeconds > 0))
          .map(timer => remaingTimeInSeconds - timer)
          .take(remaingTimeInSeconds + 1)
          .map(time => {
            return {
              minutes : Math.floor(time / 60),
              seconds : (time - Math.floor(time / 60) * 60)
            };
          })
          .subscribe(time => this.remainingTime$.next(time));
    }
  }
}

interface SongTime {
  minutes: number;
  seconds: number;
}
