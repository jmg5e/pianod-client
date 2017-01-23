import {async, fakeAsync, inject, TestBed} from '@angular/core/testing';

import {Message} from './message';

describe('Message', function() {
  it('should create Message correct properties', () => {
    let mockInput = '100 pianod 175. Welcome!';
    let testMsg = new Message(mockInput);

    expect(testMsg.error).toEqual(false);
    expect(testMsg.code).toEqual(100);
    expect(testMsg.content).toEqual('pianod 175. Welcome!');
  });

  it('should create Message with error', () => {
    let mockInput = '400 Bad command blah';
    let errorMsg = new Message(mockInput);

    expect(errorMsg.error).toEqual(true);
    expect(errorMsg.code).toEqual(400);
    expect(errorMsg.content).toEqual('Bad command blah');
  });

  it('should create Message with data property', () => {
    let mockInput = '115 Station: testStation';
    let dataMsg = new Message(mockInput);

    expect(dataMsg.error).toEqual(false);
    expect(dataMsg.code).toEqual(115);
    expect(dataMsg.data).toEqual({Station : 'testStation'});

  });

});
