import {Injectable} from '@angular/core';
import {ActivatedRoute, CanActivate, Params, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {PianodService} from '../shared/pianod.service';
@Injectable()
export class StationGuard implements CanActivate {
  station: string;
  constructor(private router: Router, private route: ActivatedRoute,
              private pianodService: PianodService) {}
  canActivate(): Observable<boolean> {
    this.route.params.subscribe(params => {
      this.station = params['station']; // (+) converts string 'id' to a number
      console.log(this.station);
    });
    return this.pianodService.getStations()
        .map(stations => true)
        .take(1)
        .do(allowed => {
          if (!allowed) {
            this.router.navigate([ '/Stations' ]);
          }
        });
  }
}
