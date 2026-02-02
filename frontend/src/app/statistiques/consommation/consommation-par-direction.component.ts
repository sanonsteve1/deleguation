import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

// Services et modèles
import { StatistiquesConsommationService } from '../../../services/statistiques-consommation.service';
import { ConsommationParDirection } from '../../../models/consommation-par-direction';

@Component({
  selector: 'app-consommation-par-direction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    ProgressSpinnerModule,
    DropdownModule,
    ButtonModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Consommations par Direction</h2>
        
        <!-- Filtres -->
        <div class="flex gap-4 items-center">
          <p-dropdown 
            [options]="annees" 
            [(ngModel)]="anneeSelectionnee" 
            placeholder="Année"
            (onChange)="chargerDonnees()"
            class="w-32">
          </p-dropdown>
          
          <p-dropdown 
            [options]="niveauxTension" 
            [(ngModel)]="niveauTensionSelectionne" 
            placeholder="Niveau Tension"
            optionLabel="designation"
            optionValue="id"
            (onChange)="chargerDonnees()"
            class="w-48">
          </p-dropdown>
          
          <p-dropdown 
            [options]="modesFacturation" 
            [(ngModel)]="modeFacturationSelectionne" 
            placeholder="Mode Facturation"
            optionLabel="designation"
            optionValue="id"
            (onChange)="chargerDonnees()"
            class="w-48">
          </p-dropdown>
          
          <p-dropdown 
            [options]="categoriesClient" 
            [(ngModel)]="categorieClientSelectionnee" 
            placeholder="Catégorie Client"
            optionLabel="designation"
            optionValue="id"
            (onChange)="chargerDonnees()"
            class="w-48">
          </p-dropdown>
          
          <p-button 
            icon="pi pi-refresh" 
            label="Actualiser" 
            (onClick)="chargerDonnees()"
            [loading]="loading">
          </p-button>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="text-center py-8">
        <p-progressSpinner [style]="{'width': '50px', 'height': '50px'}" strokeWidth="4"></p-progressSpinner>
        <p class="mt-4 text-gray-600">Chargement des données de consommation...</p>
      </div>

      <!-- Error state -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Erreur:</strong> {{ error }}
      </div>

      <!-- Graphique -->
      <div *ngIf="donnees && !loading" class="grid grid-cols-1 gap-6">
        
        <!-- Graphique en barres -->
        <p-card header="Consommations kWh par Direction" class="h-96">
          <div class="h-80">
            <p-chart 
              type="bar" 
              [data]="chartData" 
              [options]="chartOptions"
              [responsive]="true">
            </p-chart>
          </div>
        </p-card>

        <!-- Tableau de données -->
        <p-card header="Détails par Direction">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consommation (kWh)
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Couleur
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let item of donnees">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ item.directionDesignation }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.directionCode }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatNumber(item.consommationKwh) }} kWh
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div 
                        class="w-4 h-4 rounded mr-2" 
                        [style.background-color]="item.couleur">
                      </div>
                      <span class="text-sm text-gray-600">{{ item.couleur }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </p-card>
      </div>

      <!-- Message si pas de données -->
      <div *ngIf="!donnees?.length && !loading && !error" class="text-center py-8">
        <p class="text-gray-600">Aucune donnée de consommation disponible pour les critères sélectionnés.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ConsommationParDirectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données
  donnees: ConsommationParDirection[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  anneeSelectionnee = 2024;
  niveauTensionSelectionne: number | null = null;
  modeFacturationSelectionne: number | null = null;
  categorieClientSelectionnee: number | null = null;

  // Options des filtres
  annees = [2024, 2025];
  niveauxTension: any[] = [];
  modesFacturation: any[] = [];
  categoriesClient: any[] = [];

  // Configuration du graphique
  chartData: any = {};
  chartOptions: any = {};

  constructor(
    private statistiquesService: StatistiquesConsommationService
  ) {}

  ngOnInit() {
    this.initialiserOptionsGraphique();
    this.chargerDonnees();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initialiserOptionsGraphique() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = this.formatNumber(context.parsed.y);
              return `${label}: ${value} kWh`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Directions'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          title: {
            display: true,
            text: 'Consommation (kWh)'
          },
          beginAtZero: true,
          ticks: {
            callback: (value: any) => this.formatNumber(value)
          }
        }
      }
    };
  }

  chargerDonnees() {
    this.loading = true;
    this.error = null;

    this.statistiquesService.getConsommationsParDirection(
      this.anneeSelectionnee,
      this.niveauTensionSelectionne || undefined,
      this.modeFacturationSelectionne || undefined,
      this.categorieClientSelectionnee || undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.donnees = data;
        this.mettreAJourGraphique();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Erreur lors du chargement des données de consommation';
        this.loading = false;
      }
    });
  }

  private mettreAJourGraphique() {
    if (!this.donnees.length) {
      this.chartData = {
        labels: [],
        datasets: []
      };
      return;
    }

    this.chartData = {
      labels: this.donnees.map(d => d.directionDesignation),
      datasets: [{
        label: 'Consommation kWh',
        data: this.donnees.map(d => d.consommationKwh),
        backgroundColor: this.donnees.map(d => d.couleur),
        borderColor: this.donnees.map(d => this.assombrirCouleur(d.couleur)),
        borderWidth: 1
      }]
    };
  }

  private assombrirCouleur(couleur: string): string {
    // Fonction simple pour assombrir une couleur hexadécimale
    const hex = couleur.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }
}
