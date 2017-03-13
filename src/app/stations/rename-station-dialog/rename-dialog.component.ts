import {Component, OnInit} from '@angular/core';

import {MdDialogConfig, MdDialogRef} from '@angular/material';
@Component({
  selector : 'app-rename-dialog',
  templateUrl : './rename-dialog.component.html',
  styleUrls : [ './rename-dialog.component.scss' ]
})

export class RenameDialogComponent implements OnInit {
  config: MdDialogConfig = new MdDialogConfig();
  station: string;

  constructor(public dialogRef: MdDialogRef<RenameDialogComponent>) {}

  ngOnInit() {}
}
