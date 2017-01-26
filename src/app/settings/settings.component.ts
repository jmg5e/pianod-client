import {Component, OnInit} from '@angular/core';
import {User} from '../user';

@Component({
  selector : 'app-settings',
  templateUrl : './settings.component.html',
  styleUrls : [ './settings.component.scss' ]
})

export class SettingsComponent implements OnInit {

  // getting settings from pianod requires alot socket of traffic
  // need user privileges for alot of these settings
  pandoraUsername: string;
  pandoraPassword; // can be encrypted by pianod
  constructor() {}

  ngOnInit() {}
}

// list of potential settings to include
/*
* get/set pandora user
* [remember] pandora user {user} {passwd} [mine|unowned]
* pandora user {user} {passwd} managed by {user}
* pandora use {user}
* wait for authentication
* pandora list users
* get/set tls fingerprint
* shutdown
* ---user managment---
* users list
* create <listener|user|admin> {user} {passwd}
* set user password {user} {password}
* set user rank {user} <disabled|listener|user|admin>
* delete user {user}
* grant <service|influence|tuner> to {user} ...
* revoke <service|influence|tuner> from {user} .. * delete user
*/
