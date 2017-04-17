// import {Component, OnInit} from '@angular/core';
import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {Message} from '../shared/models/message';
import {PianodService} from '../shared/pianod.service';
import {MessagePipe} from './message.pipe';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})

export class CommandLineComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageList') private scrollContainer: ElementRef;
  showColors = false;
  showCodes = false;
  messagesLimit = 50;
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

  // inputEventHandler(event) {
  //   event.preventDefault();
  //   if (event.keyCode === 40) {
  //     console.log('down arrow');
  //   } else if (event.keyCode === 38) {
  //     console.log('up arrow');
  //   }
  // }
}
