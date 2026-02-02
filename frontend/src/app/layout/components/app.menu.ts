import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu, [app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: ` <ul class="layout-menu" #menuContainer>
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`
})
export class AppMenu {
    el: ElementRef = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

	model: MenuItem[] = [
		{
			label: 'Accueil',
			icon: 'pi pi-home',
			routerLink: ['/accueil']
		},
		{
			label: 'Suivi Agents',
			icon: 'pi pi-map-marker',
			items: [
				{
					label: 'Dashboard Manager',
					icon: 'pi pi-chart-line',
					routerLink: ['/suivi-agents/dashboard']
				},
				{
					label: 'Sessions en Cours',
					icon: 'pi pi-play-circle',
					routerLink: ['/suivi-agents/sessions']
				},
				{
					label: 'Visualisation Carte',
					icon: 'pi pi-map',
					routerLink: ['/suivi-agents/carte']
				},
				{
					label: 'Rapports et Statistiques',
					icon: 'pi pi-file-pdf',
					routerLink: ['/suivi-agents/rapports']
				},
				{
					label: 'Gestion des Agents',
					icon: 'pi pi-users',
					routerLink: ['/suivi-agents/gestion-agents']
				},
				{
					label: 'Gestion des Entreprises',
					icon: 'pi pi-building',
					routerLink: ['/suivi-agents/gestion-entreprises']
				},
				{
					label: 'Alertes',
					icon: 'pi pi-bell',
					routerLink: ['/suivi-agents/alertes']
				},
				{
					label: 'Temps de Travail',
					icon: 'pi pi-clock',
					routerLink: ['/suivi-agents/temps-travail']
				}
			]
		}
	];

}
