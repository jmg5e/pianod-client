import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-connect',
  templateUrl : './connect.component.html',
  styleUrls : [ './connect.component.scss' ]
})
export class ConnectComponent implements OnInit {

  // connected;
  hostname: string = 'localhost';
  port: number = 4446;

  constructor(private pianodService: PianodService) {}

  ngOnInit() { this.connect(); }
  onSubmit() { this.connect(); }
  connect() {
    let socketUrl = `ws://${this.hostname}:${this.port}/pianod`;
    this.pianodService.connect(socketUrl);
  }
}
