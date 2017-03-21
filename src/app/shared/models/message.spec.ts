import {inject, TestBed} from '@angular/core/testing';

import {Message} from './message';

describe('Message', function() {
  it('should create Message with correct properties', () => {
    const packet = '100 pianod 175. Welcome!';
    const testMsg = new Message(packet);

    expect(testMsg.error).toEqual(false);
    expect(testMsg.code).toEqual(100);
    expect(testMsg.content).toEqual('pianod 175. Welcome!');
  });

  it('should create Message with error', () => {
    const packet = '400 Bad command blah';
    const errorMsg = new Message(packet);

    expect(errorMsg.error).toEqual(true);
    expect(errorMsg.code).toEqual(400);
    expect(errorMsg.content).toEqual('Bad command blah');
  });

  it('should create Message with data property', () => {
    const packet = '115 Station: testStation';
    const dataMsg = new Message(packet);

    expect(dataMsg.error).toEqual(false);
    expect(dataMsg.code).toEqual(115);
    expect(dataMsg.data).toEqual({Station : 'testStation'});
  });

  it('Message isValid should return true for valid messages', () => {
    const validMessages = [
      '100 pianod 175. Welcome!', '115 Station: testStation', '200 Success'
    ];

    validMessages.forEach(
        validMsg => { expect(Message.isValid(validMsg)).toBeTruthy(); });
  });

  it('Message isValid should return false for invalid messages', () => {
    const invalidMessages = [ '', '132', '132 ', '12 message content', ' 132 content'];

    invalidMessages.forEach(invalidMsg => {
      expect(Message.isValid(invalidMsg)).toBeFalsy();
    });

  });

});
