import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PianodService} from '../pianod.service';

@Component({
  moduleId : module.id,
  selector : 'app-login',
  templateUrl : './login.component.html',
  styleUrls : [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
  // @Inject(FormBuilder) fb: FormBuilder;

  // loginForm: FormGroup;
  submitted = false;
  login = {name : 'admin', password : 'admin'};
  constructor(private pianodService: PianodService) {}

  ngOnInit() {}

  onSubmit() {
    this.submitted = true;
    this.pianodService.sendCmd(
        `user ${this.login.name} ${this.login.password}`);
  }
}
