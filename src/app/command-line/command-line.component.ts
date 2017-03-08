import {Component, OnInit} from '@angular/core';

import {Message} from '../shared/models/message';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-command-line',
  templateUrl : './command-line.component.html',
  styleUrls : [ './command-line.component.scss' ]
})
export class CommandLineComponent implements OnInit {
  showCodes: boolean;
  bufferLimit: number;
  pianodMessages: Array<Message>;
  constructor(private pianodService: PianodService) {
    this.pianodMessages = [];
  }

  ngOnInit() {
    this.pianodService.pianodMessages$.subscribe(
        msg => { this.pianodMessages.push(msg); });
  }
}
