import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { articleUploadGuard } from './article-upload.guard';

describe('articleUploadGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => articleUploadGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
