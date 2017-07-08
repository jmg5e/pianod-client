import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized} from '@angular/router';
import {RouterExtensions} from 'nativescript-angular/router';
import * as Toast from 'nativescript-toast';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
// import {GestureTypes, SwipeGestureEventData} from 'ui/gestures';
import {SelectedIndexChangedEventData, TabView, TabViewItem} from 'ui/tab-view';

import {UserInfo} from '../models';
import {LoginService} from '../services/login.service';
import {PianodService} from '../services/pianod.service';

import dialogs = require('ui/dialogs');
@Component({
  selector: 'app-home',
  moduleId: module.id,
  templateUrl: './home.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomeComponent implements OnInit, OnDestroy {
  user: UserInfo;
  user$: Subscription;
  errors: any;
  errors$: Subscription;
  selectedIndex = 0;
  stationUrl;

  public tabviewitems: Array<any>;
  public constructor(
      private loginService: LoginService, private router: RouterExtensions,
      private pianodService: PianodService, private _router: Router, private ngZone: NgZone) {}

  public ngOnInit() {
    this.loginService.tryAutoLogin();
    this.user$ = this.pianodService.getUser().subscribe(user => {
      this.ngZone.run(() => {
        this.user = user;
      });
    });
    this.errors$ = this.pianodService.getErrors().subscribe(error => {
      // console.log(error);
      Toast.makeText(error).show();
    });

    // on tab change dont change stations view
    // seems to reuse station-detail component which is nice
    // is kinda a hack: probably a more elegant solution for this
    this._router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.stationUrl = event.url;
        // console.dir(event);
      }
    });
  }

  public ngOnDestroy() {
    if (this.user$) {
      this.user$.unsubscribe();
    }
  }


  public openLogin() {
    dialogs
        .login({
          title: 'Login',
          message: 'Pianod User',
          okButtonText: 'Ok',
          cancelButtonText: 'Cancel',
          // neutralButtonText: 'Neutral',
          userName: 'admin',
          password: 'admin'
        })
        .then(r => {
          // console.log(
          //     'Dialog result: ' + r.result + ', user: ' + r.userName + ', pwd: ' + r.password);
          this.pianodService.login(r.userName, r.password);
        });
  }

  public logout() {
    this.pianodService.logout();
  }

  public disconnect() {
    this.pianodService.disconnect();
  }

  // onSwipe(args: SwipeGestureEventData) {
  //   console.log('Swipe Direction: ' + args.direction);
  // }

  public onIndexChanged(args) {
    const tabView = <TabView>args.object;
    // console.log('Selected index changed! New inxed: ' + tabView.selectedIndex);
    if (tabView.selectedIndex === 1) {
      if (this.stationUrl) {
        this.router.navigateByUrl(this.stationUrl);
      } else {
        this.router.navigate(['Home', {outlets: {'Stations': ['Stations']}}]);
      }
    }
  }
}
