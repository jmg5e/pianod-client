import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {Message} from '../models/message';
import {PianodService} from '../services/pianod.service';

import {MessagePipe} from './message.pipe';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})

export class CommandLineComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList') private scrollContainer: ElementRef;
  // showColors = true;
  showCodes = true;
  messagesLimit = 100;
  pianodMessages: Array<Message>;
  pianodMessages$: Subscription;
  // history: Array<string>;
  constructor(private pianodService: PianodService) {
    this.pianodMessages = [];
  }

  ngOnInit() {
    this.pianodMessages$ = this.pianodService.getMessages().subscribe(msg => {
      if (this.pianodMessages.length >= this.messagesLimit) {
        this.pianodMessages.shift();
      }

      this.pianodMessages.push(msg);
    });
  }

  ngOnDestroy() {
    if (this.pianodMessages$) {
      this.pianodMessages$.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

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

  clearMessages() {
    this.pianodMessages = [];
  }
}
