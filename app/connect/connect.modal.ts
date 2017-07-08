import {Component} from '@angular/core';
import {ModalDialogParams} from 'nativescript-angular/directives/dialogs';
import {Connection} from '../models';

@Component({
  selector: 'app-connect-modal',
  moduleId: module.id,
  templateUrl: './connect.modal.html',
})

export class ConnectModalComponent {
  public constructor(private params: ModalDialogParams) {}

  public close(res: Connection) {
    this.params.closeCallback(res);
  }
}
