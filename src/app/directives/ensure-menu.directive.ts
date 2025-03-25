import { Directive, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appEnsureMenu]',
  standalone: true
})
export class EnsureMenuDirective implements AfterViewInit, OnDestroy {
  private observer!: MutationObserver;
  
  constructor() {}
  
  ngAfterViewInit() {
    // Only apply the fix once on init, don't continuously monitor
    this.fixMenuLayout();
  }
  
  ngOnDestroy() {
    // Clean up the observer when the directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  private fixMenuLayout() {
    // Ensure main content has proper padding
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.paddingTop = '16px';
    }
    
    // Ensure menu button is visible
    const menuButtons = document.querySelectorAll('ion-menu-button');
    menuButtons.forEach((button) => {
      (button as HTMLElement).style.display = 'block';
    });
  }
} 