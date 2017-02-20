import {Injectable} from '@angular/core';

@Injectable()
export class LocalStorageService {
  public favorites: Array<any>;
  // public pianodUrl; // auto connect
  constructor() {
    // localStorage.clear();
    let storedFavorites = this.get('favorites');
    if (!storedFavorites) {
      this.save('favorites', []);
      this.favorites = [];
    } else {
      this.favorites = storedFavorites;
    }
    // this.pianodUrl = this.get('pianodUrl');
  }

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

  remove(name) {
    let data = JSON.parse(window.localStorage.getItem('Pianod'));
    window.localStorage.removeItem('Pianod');
    if (data[name]) {
      delete data[name];
    };
    window.localStorage.setItem('Pianod', JSON.stringify(data));
  }

  addToFavorites(host, port) {
    if (!this.favoriteExists(host, port)) {
      let favorites = this.get('favorites');
      favorites.push({host : host, port : port, auto_connect : false});
      this.save('favorites', favorites);
      this.favorites = favorites;
    }
  }

  removeFromFavorites(item) {
    this.favorites = this.favorites.filter(x => x.port !== item.port ||
                                                x.host !== item.host);
    this.save('favorites', this.favorites);
  }

  toggleAutoConnect(item) {
    item.auto_connect = !item.auto_connect;
    // if (item.auto_connect) {
    //   // this.pianodUrl = `ws://${item.host.trim()}:${item.port}/pianod`;
    //   // this.save('pianodUrl', this.pianodUrl);
    // } else {
    //   this.remove('pianodUrl');
    // }
    this.favorites = this.favorites.map(x => {
      if (x.port === item.port && x.host === item.host) {
        x = item;
      } else {
        x.auto_connect = false;
      }
      return x;
    });
    this.save('favorites', this.favorites);
  }

  getFavorites() { return this.favorites; }

  private favoriteExists(host, port) {
    if (this.favorites.filter(x => x.port === port && x.host === host).length >
        0) {
      return true;
    } else {
      return false;
    }
  }
}
