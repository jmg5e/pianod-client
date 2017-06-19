import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {SongTime} from './song-time';

export class Song {
  public data = {} as SongInfo;
  public totalTime: SongTime;
  public playedTime: SongTime;
  public remainingTime: SongTime;
  private playedTime$: BehaviorSubject<SongTime>;
  private isPlaying = false;
  public songCountDown: Subscription;

  constructor() {
    this.totalTime = new SongTime();
    this.playedTime = new SongTime();
    this.remainingTime = new SongTime();
    this.playedTime$ = new BehaviorSubject(this.playedTime);
    this.data.totalTime = this.totalTime;
  }

  public update(data) {
    Object.assign(this.data, data);
  }

  public clearSong(): SongInfo {
    this.data = {} as SongInfo;
    this.data.totalTime = this.totalTime;
    return this.data;
  }

  public getSongPlayedTime(): Observable<SongTime> {
    return this.playedTime$.asObservable();  // .map(playedTime => playedTime.toString());
  }

  public startTimer() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.updatePlayedTime();
    }
  }

  public stopTimer() {
    this.isPlaying = false;
    this.playedTime = this.playedTime$.getValue();
    // save played time, total time?
  }

  public clearTime() {
    this.totalTime.clear();
    this.playedTime.clear();
    this.remainingTime.clear();
    this.playedTime$.next(this.playedTime);
  }

  // set played, remaining and total time from string
  // string should be the following format
  // played/total/remaining
  // Ex: 00:57/06:30/-05:32 Playing
  public setTime(timeMsg: string) {
    const timeMatch = timeMsg.match(new RegExp(
        '([0-9]{2})\\:([0-9]{2})/([0-9]{2})\\:([0-9]{2})/\\-([0-9]{2})\\:([0-9]{2})', 'i'));
    if (timeMatch !== null && timeMatch.length === 7) {
      this.playedTime = new SongTime(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10));
      this.totalTime = new SongTime(parseInt(timeMatch[3], 10), parseInt(timeMatch[4], 10));
      this.remainingTime = new SongTime(parseInt(timeMatch[5], 10), parseInt(timeMatch[6], 10));
      this.data.totalTime = this.totalTime;  // .toString();
      this.updatePlayedTime();
    }
  }

  private updatePlayedTime() {
    if (this.songCountDown) {
      this.songCountDown.unsubscribe();
    }

    this.songCountDown =
        Observable.timer(0, 1000)
            .takeWhile(
                () => (this.isPlaying && this.playedTime.toSeconds() <= this.totalTime.toSeconds()))
            .map(timer => this.playedTime.toSeconds() + timer)
            .take(this.remainingTime.toSeconds() + 1)
            .map(timeInSeconds => {
              const playedTime = new SongTime();
              playedTime.setTimeFromSeconds(timeInSeconds);
              return playedTime;
            })
            .subscribe((newPlayedTime: SongTime) => {
              this.playedTime$.next(newPlayedTime);
            });
  }
  }

export interface SongInfo {
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
  totalTime: SongTime;
}
