import 'rxjs/add/operator/do';

import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {PianodService} from '../services';

@Injectable()
export class ConnectGuard implements CanActivate {
  constructor(private router: Router, private pianodService: PianodService) {}
  canActivate(): Observable<boolean> {
    return this.pianodService.getConnectionState()
        .map(connected => connected)
        .take(1)
        .do(connected => {
          if (!connected) {
            this.router.navigate(['/Connect']);
          }
        });
  }
}
