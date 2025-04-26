import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedievalDialogWrapperComponent } from './medieval-dialog-wrapper.component';

describe('MedievalDialogWrapperComponent', () => {
  let component: MedievalDialogWrapperComponent;
  let fixture: ComponentFixture<MedievalDialogWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedievalDialogWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedievalDialogWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
