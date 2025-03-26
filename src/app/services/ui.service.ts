import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // BehaviorSubject to track footer visibility
  private footerVisibilitySubject = new BehaviorSubject<boolean>(true);
  public footerVisibility$ = this.footerVisibilitySubject.asObservable();

  constructor() {}

  // Method to show the footer
  showFooter(): void {
    this.footerVisibilitySubject.next(true);
  }

  // Method to hide the footer
  hideFooter(): void {
    this.footerVisibilitySubject.next(false);
  }

  // Method to get current footer visibility
  getFooterVisibility(): boolean {
    return this.footerVisibilitySubject.value;
  }
} 