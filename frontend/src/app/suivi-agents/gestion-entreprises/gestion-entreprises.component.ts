import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { EntrepriseService } from '../../../services/entreprise.service';
import { Entreprise, CreateEntrepriseDto, UpdateEntrepriseDto } from '../../../models/entreprise.model';

@Component({
    selector: 'app-gestion-entreprises',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        TextareaModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './gestion-entreprises.component.html',
    styleUrls: ['./gestion-entreprises.component.scss']
})
export class GestionEntreprisesComponent implements OnInit {
    entreprises: Entreprise[] = [];
    entrepriseDialog: boolean = false;
    entreprise: Entreprise | null = null;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    
    // Formulaire
    formData: {
        nom: string;
        description: string;
        adresse: string;
        telephone: string;
        email: string;
    } = {
        nom: '',
        description: '',
        adresse: '',
        telephone: '',
        email: ''
    };

    constructor(
        private entrepriseService: EntrepriseService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.chargerEntreprises();
    }

    chargerEntreprises(): void {
        this.loading = true;
        this.entrepriseService.getAllEntreprises().subscribe({
            next: (data) => {
                this.entreprises = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des entreprises:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la liste des entreprises',
                    life: 3000
                });
                this.loading = false;
            }
        });
    }

    ouvrirNouveau(): void {
        this.entreprise = null;
        this.isEditMode = false;
        this.submitted = false;
        this.formData = {
            nom: '',
            description: '',
            adresse: '',
            telephone: '',
            email: ''
        };
        this.entrepriseDialog = true;
    }

    modifierEntreprise(entreprise: Entreprise): void {
        this.entreprise = { ...entreprise };
        this.isEditMode = true;
        this.submitted = false;
        this.formData = {
            nom: entreprise.nom,
            description: entreprise.description || '',
            adresse: entreprise.adresse || '',
            telephone: entreprise.telephone || '',
            email: entreprise.email || ''
        };
        this.entrepriseDialog = true;
    }

    supprimerEntreprise(entreprise: Entreprise): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'entreprise "${entreprise.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.loading = true;
                this.entrepriseService.deleteEntreprise(entreprise.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Entreprise supprimée avec succès',
                            life: 3000
                        });
                        this.chargerEntreprises();
                    },
                    error: (error) => {
                        console.error('Erreur lors de la suppression:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de supprimer l\'entreprise',
                            life: 3000
                        });
                        this.loading = false;
                    }
                });
            }
        });
    }

    sauvegarder(): void {
        this.submitted = true;

        // Validation
        if (!this.formData.nom) {
            return;
        }

        this.loading = true;

        if (this.isEditMode && this.entreprise) {
            // Mise à jour
            const updateDto: UpdateEntrepriseDto = {
                nom: this.formData.nom,
                description: this.formData.description || undefined,
                adresse: this.formData.adresse || undefined,
                telephone: this.formData.telephone || undefined,
                email: this.formData.email || undefined
            };

            this.entrepriseService.updateEntreprise(this.entreprise.id, updateDto).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Entreprise modifiée avec succès',
                        life: 3000
                    });
                    this.entrepriseDialog = false;
                    this.chargerEntreprises();
                },
                error: (error) => {
                    console.error('Erreur lors de la modification:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de modifier l\'entreprise',
                        life: 3000
                    });
                    this.loading = false;
                }
            });
        } else {
            // Création
            const createDto: CreateEntrepriseDto = {
                nom: this.formData.nom,
                description: this.formData.description || undefined,
                adresse: this.formData.adresse || undefined,
                telephone: this.formData.telephone || undefined,
                email: this.formData.email || undefined
            };

            this.entrepriseService.createEntreprise(createDto).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Entreprise créée avec succès',
                        life: 3000
                    });
                    this.entrepriseDialog = false;
                    this.chargerEntreprises();
                },
                error: (error) => {
                    console.error('Erreur lors de la création:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de créer l\'entreprise',
                        life: 3000
                    });
                    this.loading = false;
                }
            });
        }
    }

    annuler(): void {
        this.entrepriseDialog = false;
        this.submitted = false;
        this.entreprise = null;
        this.formData = {
            nom: '',
            description: '',
            adresse: '',
            telephone: '',
            email: ''
        };
    }
}
