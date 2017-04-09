import {Component, OnInit} from '@angular/core';
import {PianodService} from '../shared/pianod.service';
@Component({
  selector : 'app-queue',
  templateUrl : './queue.component.html',
  styleUrls : [ './queue.component.scss' ]
})
export class QueueComponent implements OnInit {

  queueList: any;
  queue;
  constructor(private pianodService: PianodService) {}

  ngOnInit() { this.queue = this.pianodService.getQueueList(); }

  removeItem(seed) {
    console.log('removing seed ', seed);
    this.pianodService.sendCmd(`REQUEST CANCEL WHERE id=\"${seed.ID}\"`)
        .then(res => console.log(res));
  }

  clearQueue() {

    this.pianodService.sendCmd('REQUEST CLEAR').then(res => console.log(res));
  }
}
