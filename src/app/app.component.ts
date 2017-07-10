import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {ConnectService} from './services/connect.service';
import {LocalStorageService} from './services/local-storage.service';
import {LoginService} from './services/login.service';
import {NotificationService} from './services/notification.service';
import {PianodService} from './services/pianod.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ConnectService, LoginService],
})

export class AppComponent implements OnInit, OnDestroy {
  error: Subscription;

  constructor(
      private pianodService: PianodService, private notifcationService: NotificationService) {}

  ngOnInit() {
    this.error = this.pianodService.getErrors().subscribe(
        err => this.notifcationService.showNotification(err));
  }

  ngOnDestroy() {
    if (this.error) {
      this.error.unsubscribe();
    }
  }
}
