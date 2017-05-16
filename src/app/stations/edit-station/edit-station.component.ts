import 'rxjs/add/operator/do';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {PianodService} from '../../shared/pianod.service';

@Component({
    selector : 'app-edit-station',
    templateUrl : './edit-station.component.html',
    styleUrls : [ './edit-station.component.scss' ]
})
export class EditStationComponent implements OnInit {

    station: string;
    seeds;
    seeds$;
    subscription;
    constructor(private route: ActivatedRoute,
        private pianodService: PianodService) {}
    ngOnInit() {
        this.subscription =
            this.route.params.take(1)
            .map(params => {
                return params['station']; // (+) converts string 'id' to a number
            })
            .subscribe(station => {
                this.station = station;
                if (station) {
                    this.getStationSeeds(station);
                }
            });
    }
    private getStationSeeds(station) {
        console.log('getting station seeds', station);
        this.seeds$ = this.pianodService.getStationSeeds(station).then( seeds => {
            console.log(seeds);
            this.seeds = seeds;
        });
    }
}
