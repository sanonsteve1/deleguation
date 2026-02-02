import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BailleurService } from 'src/services/bailleur.service';
import { Bailleur } from 'src/models/bailleur';

@Component({
    selector: 'app-bailleur',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, TableModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, TagModule, TooltipModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './bailleur.html',
    styleUrls: ['./bailleur.scss']
})
export class BailleurComponent {
    bailleurs: Bailleur[] = [];
    bailleursAffiches: Bailleur[] = [];
    bailleur: Bailleur = {} as Bailleur;
    bailleurDialog: boolean = false;
    submitted: boolean = false;

    searchTerm: string = '';
    @ViewChild('dt') dt: Table;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private bailleurService: BailleurService
    ) {
        this.loadBailleurs();
    }
    filtrer(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    loadBailleurs() {
        this.bailleurService.lister().subscribe({
            next: (bailleurs) => {
                // reverse the order of the bailleurs
                this.bailleurs = bailleurs.reverse();
                this.bailleursAffiches = this.bailleurs;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des bailleurs:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les bailleurs'
                });
            }
        });
    }

    openNew() {
        this.bailleur = {} as Bailleur;
        this.submitted = false;
        this.bailleurDialog = true;
    }

    editBailleur(bailleur: Bailleur) {
        this.bailleur = { ...bailleur };
        this.bailleurDialog = true;
    }

    hideDialog() {
        this.bailleurDialog = false;
        this.submitted = false;
    }

    /**
     * Modifier un bailleur.
     * @param bailleur le bailleur à modifier
     */

    modifierBailleur(bailleur: Bailleur) {
        this.bailleurService.enregistrer(this.bailleur).subscribe({
            next: () => {
                this.loadBailleurs();

                this.submitted = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Le bailleur a été mis à jour avec succès',
                    life: 3000
                });
                this.hideDialog();
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour du bailleur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de mettre à jour le bailleur'
                });
            }
        });

        this.bailleur = { ...bailleur };
        this.submitted = false;
        this.bailleurDialog = true;
    }

    /**
     * Enregistrer un bailleur.
     */

    enregistrerBailleur() {
        this.submitted = true;
        // this.bailleur.id = this.createId();
        // this.bailleur.code = this.createCode();
        this.bailleurs.push(this.bailleur);
        console.log(this.bailleur);
        this.bailleurService.enregistrer(this.bailleur).subscribe({
            next: () => {
                this.loadBailleurs();

                this.submitted = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Le bailleur a été enregistré avec succès',
                    life: 3000
                });
                this.hideDialog();
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour du bailleur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Impossible d'enregistrer le bailleur"
                });
            }
        });
    }

    /**
     * Supprimer un bailleur.
     * @param bailleur le bailleur à supprimer
     */
    supprimerBailleur(bailleur: Bailleur) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le bailleur ${bailleur.designation} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.bailleurService.supprimer(bailleur.id).subscribe({
                    next: () => {
                        this.loadBailleurs();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Le bailleur a été supprimé avec succès',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Erreur lors de la suppression du bailleur:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de supprimer le bailleur'
                        });
                    }
                });
            }
        });
    }

    /**
     * Trouver l'index d'un bailleur par son id.
     * @param id l'id du bailleur
     * @returns l'index du bailleur
     */
    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.bailleurs.length; i++) {
            if (this.bailleurs[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): number {
        let maxId = 0;
        for (let bailleur of this.bailleurs) {
            if (bailleur.id > maxId) {
                maxId = bailleur.id;
            }
        }
        return maxId + 1;
    }

    createCode(): string {
        return 'BAIL' + String(this.createId()).padStart(3, '0');
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

    filtrerBailleurs(event: any) {
        this.bailleursAffiches = this.bailleurs.filter((bailleur) => bailleur.designation.includes(event.target.value));
    }
}
