import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Utilisateur } from '../../models/utilisateur.model';

@Component({
    selector: 'app-accueil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './accueil.component.html',
    styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {
    utilisateur: Utilisateur | null = null;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.utilisateur = this.authService.getUtilisateurConnecte();
    }
}

