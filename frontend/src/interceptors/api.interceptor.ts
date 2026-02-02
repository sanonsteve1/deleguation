import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@environments/environment';
import { ApplicationMessageService } from '../services/message-service.service';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const applicationMessageService = inject(ApplicationMessageService);
    const authService = inject(AuthService);

    const apiUrl = environment.apiUrl;
    const url = environment.url;
    const token = localStorage.getItem('access_token');

    if (!authService.isAuthenticated()) {
        authService.deconnecter();
    }

    const isAbsoluteUrl = (url: string) => {
        const absolutePattern = /^http?:\/\//i;
        return absolutePattern.test(url);
    };

    const preparerUrl = (url: string) => {
        if (['assets', 'data', 'commits.json'].some((keyword) => url.includes(keyword))) {
            return url;
        }

        url = isAbsoluteUrl(url) ? url : apiUrl + '/' + url;
        return url.replace(/([^:]\/)\/+/g, '$1');
    };

    // Clone the request and add the authorization header
    const authReq = req.clone({
        url: preparerUrl(req.url),
        withCredentials: true,
        setHeaders: {
            Authorization: token ? `Bearer ${token}` : '',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': url,
            'Access-Control-Expose-Headers': 'Authorization',
            // Header pour contourner la page d'avertissement ngrok (plan gratuit)
            'ngrok-skip-browser-warning': 'true'
        }
    });

    applicationMessageService.clear();
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Gérer les erreurs 401 (Unauthorized) - Token expiré ou invalide
            if (error.status === 401) {
                // Déconnecter l'utilisateur et rediriger vers la connexion
                authService.deconnecter();
            }
            return throwError(() => error);
        })
    );
};
