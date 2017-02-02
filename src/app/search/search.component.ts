import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';

@Component({
  selector : 'app-search',
  templateUrl : './search.component.html',
  styleUrls : [ './search.component.scss' ]
})

export class SearchComponent implements OnInit {
  results = [];
  category = 'Artist';
  searching: boolean = false;
  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  // this is slow sometimes, could create seperate socket just for searching
  search(searchTerm, category) {
    console.log('searching');
    this.searching = true;
    this.pianodService.search(searchTerm, category)
        .then((results: any) => {
          console.log(results);
          this.results = results;
          this.searching = false;
        })
        .catch((err) => { this.searching = false; });
  }
}
