import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { EntrepriseService } from '../../../services/entreprise.service';
import { AuthService } from '../../../services/auth.service';
import { Utilisateur, Role, StatutUtilisateur, CreateUtilisateurDto, UpdateUtilisateurDto } from '../../../models/utilisateur.model';
import { Entreprise } from '../../../models/entreprise.model';

@Component({
    selector: 'app-gestion-agents',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        ToastModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './gestion-agents.component.html',
    styleUrls: ['./gestion-agents.component.scss']
})
export class GestionAgentsComponent implements OnInit {
    utilisateurs: Utilisateur[] = [];
    utilisateurDialog: boolean = false;
    utilisateur: Utilisateur | null = null;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    
    // Formulaire
    formData: {
        username: string;
        password: string;
        nom: string;
        prenoms: string;
        telephone: string;
        role: Role | null;
        statut: StatutUtilisateur | null;
        entrepriseId: number | null;
    } = {
        username: '',
        password: '',
        nom: '',
        prenoms: '',
        telephone: '',
        role: null,
        statut: null,
        entrepriseId: null
    };

    // Liste des entreprises pour le dropdown
    entreprises: Entreprise[] = [];

    // Options pour les dropdowns
    roles: { label: string; value: Role }[] = [
        { label: 'Administrateur', value: Role.ADMIN },
        { label: 'Utilisateur', value: Role.USER },
        { label: 'Super Administrateur', value: Role.SUPER_ADMIN },
        { label: 'Agent', value: Role.AGENT }
    ];

    statuts: { label: string; value: StatutUtilisateur }[] = [
        { label: 'Actif', value: StatutUtilisateur.ACTIF },
        { label: 'Inactif', value: StatutUtilisateur.INACTIF }
    ];

    constructor(
        private utilisateurService: UtilisateurService,
        private entrepriseService: EntrepriseService,
        public authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.chargerUtilisateurs();
        this.chargerEntreprises();
    }

    chargerEntreprises(): void {
        this.entrepriseService.getAllEntreprises().subscribe({
            next: (data) => {
                this.entreprises = data;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des entreprises:', error);
            }
        });
    }

    chargerUtilisateurs(): void {
        this.loading = true;
        this.utilisateurService.getAllUtilisateurs().subscribe({
            next: (data) => {
                this.utilisateurs = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des utilisateurs:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la liste des utilisateurs',
                    life: 3000
                });
                this.loading = false;
            }
        });
    }

    ouvrirNouveau(): void {
        this.utilisateur = null;
        this.isEditMode = false;
        this.submitted = false;
        
        this.formData = {
            username: '',
            password: '',
            nom: '',
            prenoms: '',
            telephone: '',
            role: null,
            statut: StatutUtilisateur.ACTIF,
            entrepriseId: null
        };
        this.utilisateurDialog = true;
    }

    modifierUtilisateur(utilisateur: Utilisateur): void {
        this.utilisateur = utilisateur; // Utiliser l'instance directement pour préserver les méthodes
        this.isEditMode = true;
        this.submitted = false;
        
        // Convertir les types string en enum si nécessaire
        const role = typeof utilisateur.role === 'string' 
            ? (utilisateur.role as Role) 
            : utilisateur.role;
        const statut = typeof utilisateur.statut === 'string'
            ? (utilisateur.statut as StatutUtilisateur)
            : (utilisateur.statut || StatutUtilisateur.ACTIF);
        
        this.formData = {
            username: utilisateur.username,
            password: '', // Ne pas pré-remplir le mot de passe
            nom: utilisateur.nom,
            prenoms: utilisateur.prenoms,
            telephone: utilisateur.telephone || '',
            role: role as Role,
            statut: statut as StatutUtilisateur,
            entrepriseId: utilisateur.entreprise && typeof utilisateur.entreprise === 'object' 
                ? utilisateur.entreprise.id 
                : null
        };
        this.utilisateurDialog = true;
    }

    supprimerUtilisateur(utilisateur: Utilisateur): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${utilisateur.prenoms} ${utilisateur.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.loading = true;
                this.utilisateurService.deleteUtilisateur(utilisateur.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Utilisateur supprimé avec succès',
                            life: 3000
                        });
                        this.chargerUtilisateurs();
                    },
                    error: (error) => {
                        console.error('Erreur lors de la suppression:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de supprimer l\'utilisateur',
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
        if (!this.formData.nom || !this.formData.prenoms || !this.formData.role || !this.formData.statut || !this.formData.entrepriseId) {
            return;
        }

        if (!this.isEditMode && (!this.formData.username || !this.formData.password)) {
            return;
        }

        this.loading = true;

        if (this.isEditMode && this.utilisateur) {
            // Mise à jour
            const updateDto: UpdateUtilisateurDto = {
                nom: this.formData.nom,
                prenoms: this.formData.prenoms,
                telephone: this.formData.telephone || undefined,
                role: this.formData.role!,
                statut: this.formData.statut!,
                entrepriseId: this.formData.entrepriseId || undefined
            };

            this.utilisateurService.updateUtilisateur(this.utilisateur.id, updateDto).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Utilisateur modifié avec succès',
                        life: 3000
                    });
                    this.utilisateurDialog = false;
                    this.chargerUtilisateurs();
                },
                error: (error) => {
                    console.error('Erreur lors de la modification:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de modifier l\'utilisateur',
                        life: 3000
                    });
                    this.loading = false;
                }
            });
        } else {
            // Création
            const createDto: CreateUtilisateurDto = {
                username: this.formData.username,
                password: this.formData.password,
                nom: this.formData.nom,
                prenoms: this.formData.prenoms,
                telephone: this.formData.telephone || undefined,
                role: this.formData.role!,
                statut: this.formData.statut!,
                entrepriseId: this.formData.entrepriseId || undefined
            };

            this.utilisateurService.createUtilisateur(createDto).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Utilisateur créé avec succès',
                        life: 3000
                    });
                    this.utilisateurDialog = false;
                    this.chargerUtilisateurs();
                },
                error: (error) => {
                    console.error('Erreur lors de la création:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de créer l\'utilisateur',
                        life: 3000
                    });
                    this.loading = false;
                }
            });
        }
    }

    annuler(): void {
        this.utilisateurDialog = false;
        this.submitted = false;
        this.utilisateur = null;
        this.formData = {
            username: '',
            password: '',
            nom: '',
            prenoms: '',
            telephone: '',
            role: null,
            statut: null,
            entrepriseId: null
        };
    }

    getEntrepriseNom(utilisateur: Utilisateur): string {
        if (!utilisateur.entreprise) {
            return '-';
        }
        if (typeof utilisateur.entreprise === 'string') {
            return utilisateur.entreprise;
        }
        return utilisateur.entreprise.nom;
    }

    getRoleLabel(role: Role): string {
        const roleOption = this.roles.find(r => r.value === role);
        return roleOption ? roleOption.label : role;
    }

    getStatutSeverity(statut: StatutUtilisateur | undefined): 'success' | 'danger' {
        return statut === StatutUtilisateur.ACTIF ? 'success' : 'danger';
    }

    getStatutLabel(statut: StatutUtilisateur | undefined): string {
        return statut === StatutUtilisateur.ACTIF ? 'Actif' : 'Inactif';
    }

    getNomComplet(utilisateur: Utilisateur): string {
        return `${utilisateur.prenoms || ''} ${utilisateur.nom || ''}`.trim() || utilisateur.username;
    }
}
