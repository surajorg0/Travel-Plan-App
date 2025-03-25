import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { isDevMode, ErrorHandler, Injectable, importProvidersFrom, enableProdMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Register Swiper custom elements
register();

if (environment.production) {
  enableProdMode();
}

// Custom error handler to catch and log application errors
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Log the error to console
    console.error('Application Error:', error);
    
    // You could send errors to a monitoring service here
    
    // Show a user-friendly message if possible
    if (typeof document !== 'undefined') {
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.innerHTML === '') {
        appRoot.innerHTML = `
          <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
            <h3>Sorry, something went wrong</h3>
            <p>We're working to fix the issue. Please try again later.</p>
            <button onclick="window.location.reload()" style="padding: 10px 15px; background: #3880ff; color: white; border: none; border-radius: 4px; margin-top: 15px;">Reload App</button>
          </div>
        `;
      }
    }

    // Dispatch a custom event that our loading screen can listen for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appError', { detail: { error } }));
    }
  }
}

console.log('Starting application bootstrap...');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom(HttpClientModule), // Add HTTP capabilities
    provideIonicAngular({
      mode: 'md', // Force Material Design style (optional)
      animated: true,
      statusTap: true,
      backButtonText: '',
      swipeBackEnabled: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    Storage
  ],
}).catch(err => {
  console.error('Application bootstrap failed:', err);
  
  // Display a user-friendly error message
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Sorry, we couldn't start the application</h2>
        <p>There was a problem initializing the app. Please try reloading the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 15px; background: #3880ff; color: white; border: none; border-radius: 4px; margin-top: 15px;">Reload App</button>
        ${isDevMode() ? `<div style="margin-top: 20px; text-align: left; background: #f8f8f8; padding: 10px; border-radius: 4px;"><pre>${JSON.stringify(err, null, 2)}</pre></div>` : ''}
      </div>
    `;
  }
});
