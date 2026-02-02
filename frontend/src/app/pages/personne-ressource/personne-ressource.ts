import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { RessourceHumaineService } from 'src/services/ressource-humaine.service';

interface PersonneRessource {
    id: number;
    code: string;
    nom: string;
    prenoms: string;
    fonction: string;
    specialite: string;
    telephone: string;
    email: string;
    statut: string;
    nombreProjets: number;
    experience: number;
    dateCreation: string;
}

@Component({
    selector: 'app-personne-ressource',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, TableModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, TagModule, TooltipModule, ConfirmDialogModule, ToastModule, TextareaModule, DropdownModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './personne-ressource.html',
    styleUrls: ['./personne-ressource.scss']
})
export class PersonneRessourceComponent {
    personnesRessource: PersonneRessource[] = [];
    personneRessource: PersonneRessource = {} as PersonneRessource;
    personneRessourceDialog: boolean = false;
    submitted: boolean = false;
    searchTerm: string = '';

    fonctions = ['Ingénieur', 'Architecte', 'Technicien', 'Chef de chantier', 'Contrôleur qualité', 'Géomètre', 'Électricien', 'Plombier', 'Mécanicien', 'Autre'];

    specialites = ['BTP', 'Énergie', 'Hydraulique', 'Routes', 'Bâtiments', 'Électricité', 'Mécanique', 'Informatique', 'Gestion de projet', 'Autre'];

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private ressourceHumaineService: RessourceHumaineService
    ) {
        this.loadPersonnesRessource();
    }

    loadPersonnesRessource() {
        this.ressourceHumaineService.lister().subscribe({
            next: (personnesRessource) => {
                this.personnesRessource = personnesRessource;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des personnes ressources:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les personnes ressources'
                });
            }
        });
    }

    openNew() {
        this.personneRessource = {} as PersonneRessource;
        this.submitted = false;
        this.personneRessourceDialog = true;
    }

    editPersonneRessource(personneRessource: PersonneRessource) {
        this.personneRessource = { ...personneRessource };
        this.personneRessourceDialog = true;
    }

    deletePersonneRessource(personneRessource: PersonneRessource) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer ${personneRessource.prenoms} ${personneRessource.nom} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.personnesRessource = this.personnesRessource.filter((val) => val.id !== personneRessource.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Personne ressource supprimée',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.personneRessourceDialog = false;
        this.submitted = false;
    }

    savePersonneRessource() {
        this.submitted = true;

        if (this.personneRessource.nom?.trim() && this.personneRessource.prenoms?.trim()) {
            if (this.personneRessource.id) {
                this.personnesRessource[this.findIndexById(this.personneRessource.id)] = this.personneRessource;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Personne ressource mise à jour',
                    life: 3000
                });
            } else {
                this.personneRessource.id = this.createId();
                this.personneRessource.code = this.createCode();
                this.personneRessource.dateCreation = new Date().toISOString().split('T')[0];
                this.personnesRessource.push(this.personneRessource);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Personne ressource créée',
                    life: 3000
                });
            }

            this.personnesRessource = [...this.personnesRessource];
            this.personneRessourceDialog = false;
            this.personneRessource = {} as PersonneRessource;
        }
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.personnesRessource.length; i++) {
            if (this.personnesRessource[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): number {
        let maxId = 0;
        for (let personneRessource of this.personnesRessource) {
            if (personneRessource.id > maxId) {
                maxId = personneRessource.id;
            }
        }
        return maxId + 1;
    }

    createCode(): string {
        return 'PR' + String(this.createId()).padStart(3, '0');
    }

    getSeverity(statut: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (statut) {
            case 'ACTIF':
                return 'success';
            case 'INACTIF':
                return 'danger';
            case 'EN_ATTENTE':
                return 'warn';
            default:
                return 'info';
        }
    }

    getStatut(statut: string): string {
        switch (statut) {
            case 'ACTIF':
                return 'Actif';
            case 'INACTIF':
                return 'Inactif';
            case 'EN_ATTENTE':
                return 'En attente';
            default:
                return statut;
        }
    }
}
