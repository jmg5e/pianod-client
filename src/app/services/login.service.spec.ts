import {async, inject, TestBed} from '@angular/core/testing';
import {LocalStorageService, LoginService, PianodService} from '../services';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

const mockPianod = {
  'port': 4201,
  'host': 'localhost'
};

describe('LoginService', () => {
  beforeEach(() => {
    // mock local storage
    const storage = {
      'storedConnections': [{
        'host': mockPianod.host,
        'port': mockPianod.port,
        'isDefault': true,
        'defaultUser': {'username': 'userName', 'password': 'validPass'}
      }]
    };
    window.localStorage.setItem('Pianod', JSON.stringify(storage));
    TestBed.configureTestingModule({
      providers: [PianodService, LocalStorageService]
    });
  });

  // loginService depends on PianodService & LoginService
  beforeEach(async(
      inject([PianodService, LocalStorageService], (p: PianodService, l: LocalStorageService) => {
        this.pianodService = p;
        this.localStorageService = l;
        this.pianodService.connect(mockPianod.host, mockPianod.port);
      })));

  it('should create instance of login service', (done) => {
    let loginService = new LoginService(this.localStorageService, this.pianodService);
    expect(LoginService).toBeTruthy();
    done();
  });

  it('tryAutoLogin should login to pianod with valid user after connecting to pianod', (done) => {
    let loginService = new LoginService(this.localStorageService, this.pianodService);
    loginService.tryAutoLogin();
    this.pianodService.getUser().take(2).toArray().subscribe(users => {
      expect(users[0].name).toBeUndefined();
      expect(users[1].name).toEqual('userName');
    }, err => console.log(err), () => done());
  });

});
