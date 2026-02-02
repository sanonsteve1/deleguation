import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import Material from '@primeng/themes/material';
import { definePreset } from '@primeng/themes';
import { JWT_OPTIONS, JwtHelperService, JwtInterceptor } from '@auth0/angular-jwt';
import { apiInterceptor } from './interceptors/api.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

const MyPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#e8f0fc',
            100: '#c5d9f5',
            200: '#9ec0ed',
            300: '#77a7e5',
            400: '#5a94df',
            500: '#3d81d9',
            600: '#3779d5',
            700: '#2f6ecf',
            800: '#2764ca',
            900: '#1951c0',
            950: '#346ac2'
        }
    }
});

export const httpInterceptorsProviders = [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }];

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        JwtHelperService,
        httpInterceptorsProviders,
        provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({
            ripple: true,
            inputStyle: 'filled',
            theme: { preset: MyPreset, options: { darkModeSelector: '.app-dark' } }
        }),
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }
    ]
};
