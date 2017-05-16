import {async, inject, TestBed} from '@angular/core/testing';
import {LocalStorageService} from './local-storage.service';

describe('LocalStorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({providers : [ LocalStorageService ]});
  });

  it('should create correct properties in local storage',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       expect(service).toBeTruthy();
       const pianodStorage = window.localStorage.getItem('Pianod');
       expect(JSON.parse(pianodStorage)).toEqual({storedConnections : []});
     }));

  it('service should add connection to local storage',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       const expected = {
         storedConnections :
             [ {host : 'testHost', port : 1, auto_connect : false} ]
       };
       const pianodStorage = window.localStorage.getItem('Pianod');
       expect(JSON.parse(pianodStorage)).toEqual(expected);
     }));

  it('service should not add duplicate connection to local storage with same host,port',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('test', 1);
       service.saveConnection('test', 1);
       service.saveConnection('test', 2);
       const expected = {
         storedConnections : [
           {host : 'test', port : 1, auto_connect : false},
           {host : 'test', port : 2, auto_connect : false}
         ]
       };
       const pianodStorage = window.localStorage.getItem('Pianod');
       expect(JSON.parse(pianodStorage)).toEqual(expected);
     }));

  it('service should return stored connections fronm local storage',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       const expected = [ {host : 'testHost', port : 1, auto_connect : false} ];
       const storedConnections = service.getStoredConnections();
       expect(storedConnections).toEqual(expected);
     }));

  it('service should remove stored connections fronm local storage',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       service.saveConnection('testHost', 2);
       service.deleteSavedConnection({host : 'testHost', port : 1});
       const expected = [ {host : 'testHost', port : 2, auto_connect : false} ];
       const storedConnections = service.getStoredConnections();
       expect(storedConnections).toEqual(expected);
     }));

  it('toggle auto_connect should set correct value for all stored connections',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       service.saveConnection('testHost', 2);
       service.saveConnection('testHost', 3);

       service.toggleAutoConnect({host : 'testHost', port : 1});
       const expectedAfterToggle1 = [
         {host : 'testHost', port : 1, auto_connect : true},
         {host : 'testHost', port : 2, auto_connect : false},
         {host : 'testHost', port : 3, auto_connect : false}
       ];
       expect(service.getStoredConnections()).toEqual(expectedAfterToggle1);

       service.toggleAutoConnect({host : 'testHost', 'port' : 2});
       const expectedAfterToggle2 = [
         {host : 'testHost', 'port' : 1, auto_connect : false},
         {host : 'testHost', 'port' : 2, auto_connect : true},
         {host : 'testHost', 'port' : 3, auto_connect : false}
       ];
       expect(service.getStoredConnections()).toEqual(expectedAfterToggle2);

       service.toggleAutoConnect({host : 'testHost', 'port' : 2});
       const expectedAfterToggle3 = [
         {host : 'testHost', port : 1, auto_connect : false},
         {host : 'testHost', port : 2, auto_connect : false},
         {host : 'testHost', port : 3, auto_connect : false}
       ];
       expect(service.getStoredConnections()).toEqual(expectedAfterToggle3);
     }));

  it('set connection default user should store user',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       const connectionToSave = {host : 'testHost', port : 1};
       const userToSave = {username : 'testUser', password : 'testPass'};
       service.saveConnection('testHost', 1);
       service.setDefaultUser(connectionToSave, userToSave);

       const pianodStorage = localStorage.getItem('Pianod');
       expect(JSON.parse(pianodStorage)).toEqual({
         storedConnections : [ {
           host : 'testHost',
           port : 1,
           auto_connect : false,
           defaultUser : {username : 'testUser', password : 'testPass'}
         } ]
       });
     }));

  it('get default user from connection should return correct results',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       const connectionToSave = {host : 'testHost', port : 1};
       const userToSave = {username : 'testUser', password : 'testPass'};
       service.saveConnection('testHost', 1);
       service.setDefaultUser(connectionToSave, userToSave);

       const defaultUser = service.getDefaultUser(connectionToSave);
       expect(defaultUser).toEqual(userToSave);
     }));

  it('get default user should return undefined if not set',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       const defaultUser =
           service.getDefaultUser({host : 'testHost', port : 1});

       expect(defaultUser).toBeUndefined();
     }));

  it('remove default user from connection should delete property from storage',
     inject([ LocalStorageService ], (service: LocalStorageService) => {
       service.saveConnection('testHost', 1);
       service.setDefaultUser({host : 'testHost', port : 1},
                              {username : 'testUser', password : 'testPass'});
       service.removeDefaultUser({host : 'testHost', port : 1});

       const pianodStorage = localStorage.getItem('Pianod');
       expect(JSON.parse(pianodStorage)).toEqual({
         storedConnections :
             [ {host : 'testHost', port : 1, auto_connect : false} ]
       });
     }));
});
