import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import {MessagePipe} from './message.pipe';
import {Message} from '../models/message';
import {PianodService} from '../services';

@Component({
  selector : 'app-command-line',
  templateUrl : './command-line.component.html',
  styleUrls : [ './command-line.component.scss' ]
})

export class CommandLineComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageList') private scrollContainer: ElementRef;
  showColors = true;
  showCodes = true;
  messagesLimit = 100;
  pianodMessages: Array<Message>;
  // history: Array<string>;
  constructor(private pianodService: PianodService) {
    this.pianodMessages = [];
  }

  ngOnInit() {
    this.pianodService.getMessages().subscribe(msg => {
      if (this.pianodMessages.length >= this.messagesLimit) {
        this.pianodMessages.shift();
      }

      this.pianodMessages.push(msg);
    });
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  sendCommand(inputCmd) {
    if (inputCmd.value) {
      this.pianodService.sendCmd(inputCmd.value).then(response => {
        inputCmd.value = null;
      });
    }
  }

  clearMessages() { this.pianodMessages = []; }
}
