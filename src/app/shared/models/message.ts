//
// BUG pianod help command returns a message with no content for some reason
//
export class Message {
  code: number;
  content: string;
  data: any;
  error: boolean;

  static isValid(packet: string) { return /^([0-9]{3})\s(.+)$/g.test(packet); }

  constructor(packet: string) {
    if (!Message.isValid(packet)) {
      throw new Error('invalid message: ' + packet);
    }
    const obj = this.parseData(packet);
    this.code = obj.code;

    // get data property from Message contents
    // codes betwee 109 - 121 contain "key: value"
    // TODO check documention and include all codes with data values
    if (this.code > 108 && this.code < 121) {
      this.data = this.getData(obj.content);
    } else {
      this.content = obj.content;
    }

    if (this.code >= 400 && this.code <= 500) {
      this.error = true;
    } else {
      this.error = false;
    }
  }

  // return object  from string "key: value"
  // would be nice if it was in correct json format
  // probably would be better to just format string into valid json
  private getData(content) {
    const splittedMessage = content.split(': ');
    const key: string = splittedMessage.slice(0, 1)[0];
    const prop: string = splittedMessage.slice(1).join(': ');
    if (typeof key !== 'undefined' && typeof prop !== 'undefined') {
      return {[key] : prop};
    }
  };

  // get code and content from line/packet
  private parseData(packet: string) {
    // packet = packet.trim();
    const messageMatch = packet.match(new RegExp('([0-9]{3}) (.+)', 'i'));
    if (messageMatch !== null) {
      const code = parseInt(messageMatch[1], 10);
      const content = messageMatch[2];
      return ({code : code, content : content});
    }
  }
}
