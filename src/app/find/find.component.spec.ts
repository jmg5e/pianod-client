/* tslint:disable:no-unused-variable */
import {DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {PianodService} from '../pianod.service';
import {FindComponent} from './find.component';

describe('FindComponent', () => {
  let component: FindComponent;
  let fixture: ComponentFixture<FindComponent>;

  beforeEach(async(() => {
    TestBed
        .configureTestingModule(
            {providers : [ PianodService ], declarations : [ FindComponent ]})
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
