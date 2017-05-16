import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {PianodService} from '../shared/pianod.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private pianodService: PianodService) {}
  canActivate(): Observable<boolean> {
    return this.pianodService.getUser()
        .map(user => user.privileges.admin)
        .take(1)
        .do(user => {
          if (!user) {
            this.router.navigate([ '/NowPlaying' ]);
          }
        });
  }
}
