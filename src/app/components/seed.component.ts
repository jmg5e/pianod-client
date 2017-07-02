import {Component, Input, OnInit} from '@angular/core';
import {Seed} from '../models';

@Component({
  selector: 'app-seed',
  templateUrl: './seed.component.html'
})
export class SeedComponent implements OnInit {
  @Input() seed: Seed;
  constructor() {}

  ngOnInit() {}
}
