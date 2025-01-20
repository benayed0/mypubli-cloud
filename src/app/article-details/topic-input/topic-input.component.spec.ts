import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicInputComponent } from './topic-input.component';

describe('TopicInputComponent', () => {
  let component: TopicInputComponent;
  let fixture: ComponentFixture<TopicInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopicInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
