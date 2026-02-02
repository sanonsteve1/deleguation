import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Image } from 'primeng/image';
import { LoginPassword } from '../../models/login-password.model';
import { CustomValidators } from '../../validators/custom-validators';
import { AuthService } from '../../services/auth.service';
import { Message, MessageModule } from 'primeng/message';
import { ApplicationErreur } from '../../models/application-erreur.model';
import { NgIf } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { data } from 'autoprefixer';

@Component({
    selector: 'app-login-2',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppConfigurator, InputGroup, InputGroupAddon, Image, ReactiveFormsModule, MessageModule, NgIf],
    templateUrl: './login.html'
})
export class Login implements OnInit {
    password: string = '';

    login: string = '';

    formAuthentification = new FormGroup({
        username: new FormControl('', CustomValidators.notBlank),
        password: new FormControl('', CustomValidators.notBlank)
    });
    messageErreur: ApplicationErreur;

    constructor(
        private readonly authService: AuthService,
        private readonly navigationService: NavigationService
    ) {}

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.authService.updateUtilisateurConnecte();
            this.navigationService.goToHome();
        }
    }

    authentifier() {
        this.authService.authentifier(new LoginPassword(this.formAuthentification.value)).subscribe({
            next: (data) => {
                AuthService.updateAccessToken(data.token);
                this.authService.updateUtilisateurConnecte();
                this.navigationService.goToHome();
            },
            error: (err) => {
                this.messageErreur = err.error;
            }
        });
    }
}
