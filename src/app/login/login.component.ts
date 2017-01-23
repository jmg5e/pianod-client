import {Component, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-login',
  templateUrl : './login.component.html',
  styleUrls : [ './login.component.css' ]
})
export class LoginComponent implements OnInit {

  userName: string = 'admin';
  password: string = 'admin';
  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  login() {
    this.pianodService.sendCmd(`user ${this.userName} ${this.password}`);
  }
}
