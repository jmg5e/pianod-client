/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FindComponent } from './find.component';

describe('FindComponent', () => {
  let component: FindComponent;
  let fixture: ComponentFixture<FindComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
