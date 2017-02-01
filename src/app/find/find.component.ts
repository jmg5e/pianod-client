import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-find',
  templateUrl : './find.component.html',
  styleUrls : [ './find.component.scss' ]
})
export class FindComponent implements OnInit {
  results = [];
  category = 'Artist';
  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  // this is slow... should create seperate socket just for searching
  search(searchTerm, category) {
    console.log('searching');
    // let cmd = `FIND ${category} \"${searchTerm}\"`;
    this.pianodService.search(searchTerm, category).then((results: any) => {
      console.log(results);
      this.results = results;
    });
  }
}
