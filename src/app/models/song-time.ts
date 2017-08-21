export class SongTime {
  public minutes: number;
  public seconds: number;

  constructor(minutes = 0, seconds = 0) {
    if (minutes < 0 || seconds < 0) {
      throw new RangeError();
    }

    this.minutes = minutes;
    this.seconds = seconds;
  }

  clear() {
    this.minutes = 0;
    this.seconds = 0;
  }

  setTime(minutes, seconds) {
    this.minutes = minutes;
    this.seconds = seconds;
  }

  toString(): string {
    if (this.seconds >= 10) {
      return this.minutes + ':' + this.seconds;
    } else {
      return this.minutes + ':0' + this.seconds;
    }
  }

  toSeconds(): number {
    return this.minutes * 60 + this.seconds;
  }

  setTimeFromSeconds(totalSeconds) {
    if (totalSeconds < 0) {
      throw new RangeError();
    }

    this.minutes = Math.floor(totalSeconds / 60) % 60;
    this.seconds = totalSeconds % 60;
  }
}
