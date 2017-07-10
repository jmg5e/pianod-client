import {Injectable} from '@angular/core';

import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Injectable()
export class NotificationService {
  barConfig = new MdSnackBarConfig();

  constructor(private snackBar: MdSnackBar) {
    this.barConfig.duration = 2000;
  }

  showNotification(msg: string) {
    this.snackBar.open(msg, '', this.barConfig);
  }
}
