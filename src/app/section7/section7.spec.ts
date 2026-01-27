import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section7 } from './section7';

describe('Section7', () => {
  let component: Section7;
  let fixture: ComponentFixture<Section7>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section7]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section7);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
