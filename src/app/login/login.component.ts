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
  userLogin = {name : 'admin', password : 'admin'};

  constructor(private pianodService: PianodService) {
    // console.log(localStorage);
    // this.login(localStorage.getItem('userName'),
    //            localStorage.getItem('userPass'));
    // if (localStorage['userPass'] && localStorage['userName']) {
    //   this.login(localStorage['userName'], localStorage['userPass']);
    // }
  }

  ngOnInit() {}
  onSubmit() { this.login(this.userLogin.name, this.userLogin.password); }

  login(name, password) {
    this.pianodService.sendCmd(
        `user ${this.userLogin.name} ${this.userLogin.password}`);

    this.pianodService.user$.subscribe((user) => {
      if (user.loggedIn) {
        localStorage.setItem('userName', this.userLogin.name);
        localStorage.setItem('userPass', this.userLogin.password);
      }
    });
  }
}
