import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-connect',
  templateUrl : './connect.component.html',
  styleUrls : [ './connect.component.css' ]
})
export class ConnectComponent implements OnInit {

  // connected;
  host: string = 'localhost';
  port: number = 4446;
  socketUrl: string = 'ws://localhost:4446/pianod';
  constructor(private pianodService: PianodService) {
      console.log('connected compent created');
    // this.connected = this.pianodService.connected$;
  }

  ngOnInit() {}
  updateUrl() { this.socketUrl = `ws://${this.host}:${this.port}/pianod`; }
  connect() {
    console.log('connect');
    // pianodService.connect('ws://localhost:4446/pianod');
    this.pianodService.connect(this.socketUrl);
  }
}
