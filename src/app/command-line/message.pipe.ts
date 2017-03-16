import {Pipe, PipeTransform} from '@angular/core';
import {Message} from '../shared/models/message';
@Pipe({name : 'display_message'})
export class MessagePipe implements PipeTransform {

  transform(msg: Message, args?: any): any {
    if (msg.data) {
      const keyName = Object.getOwnPropertyNames(msg.data);
      const value = msg.data[keyName.toString()];
      return `${keyName}  : ${value}`;
    } else if (msg.content) {
      return msg.content;
    } else {
      return null;
    }
  }
}
