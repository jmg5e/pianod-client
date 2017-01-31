import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-find',
  templateUrl : './find.component.html',
  styleUrls : [ './find.component.scss' ]
})
export class FindComponent implements OnInit {
  results = [];
  category = 'Any';
  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  search(searchTerm, category) {
    let cmd = `FIND ${category} \"${searchTerm}\"`;
    this.pianodService.sendCmd(cmd).then((res: any) => {
      if (res.data) {
        res.data.map((packet: Array<any>) => {
          let seed = {};
          Object.assign(seed, packet);
          console.log(seed);
          // console.log(seed.length);
        });
      }
      // console.log(res);
    });
  }
}
