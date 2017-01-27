import {Injectable} from '@angular/core';

@Injectable()
export class LocalStorageService {

  constructor() {}
  save(name, data) {
    let localData: any = window.localStorage.getItem('Pianod');
    if (localData) {
      localData = JSON.parse(localData);
    } else {
      localData = {};
    }

    localData[name] = data;

    window.localStorage.setItem('Pianod', JSON.stringify(localData));
  }

  get(name) {
    let data = JSON.parse(window.localStorage.getItem('Pianod'));
    if (!data) {
      return undefined;
    }
    if (name) {
      if (data[name]) {
        return data[name];
      } else {
        return null;
      }
    }
    return data;
  }
}
