import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {RouterExtensions} from 'nativescript-angular/router';
import {TNSFontIconService} from 'nativescript-ng2-fonticon';

import {Subscription} from 'rxjs/Subscription';
import {ConnectService} from './services/connect.service';
import {LoginService} from './services/login.service';
import {PianodService} from './services/pianod.service';


@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
  providers: [ConnectService, LoginService],
})

export class AppComponent implements OnInit, OnDestroy {
  connected = false;
  connected$: Subscription;

  public constructor(
      private router: RouterExtensions, private pianodService: PianodService,
      private fonticon: TNSFontIconService) {}

  public logout() {
    this.pianodService.logout();
  }

  public disconnect() {
    this.pianodService.disconnect();
  }

  public ngOnInit() {
    this.connected$ =
        this.pianodService.getConnectionState().subscribe(state => this.connected = state);
  }

  public ngOnDestroy() {
    if (this.connected$) {
      this.connected$.unsubscribe();
    }
  }
}
