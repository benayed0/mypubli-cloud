import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  showLoadingSpinner() {
    this.isLoadingSubject.next(true);
  }

  hideLoadingSpinner() {
    this.isLoadingSubject.next(false);
  }
}
