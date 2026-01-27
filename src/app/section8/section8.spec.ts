import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section8 } from './section8';

describe('Section8', () => {
  let component: Section8;
  let fixture: ComponentFixture<Section8>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section8]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section8);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
