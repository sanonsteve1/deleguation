import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services et modèles
import { FinancementService } from '../../../services/financement.service';
import { FinancementStats } from '../../../models/financement.model';

@Component({
    selector: 'app-financement-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ChartModule, ProgressBarModule, ProgressSpinnerModule],
    template: `
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-6">Dashboard Financement</h2>

            <!-- Loading state -->
            <div *ngIf="loading" class="text-center py-8">
                <p-progressSpinner [style]="{ width: '50px', height: '50px' }" strokeWidth="4"></p-progressSpinner>
                <p class="mt-4 text-gray-600">Chargement des données de financement...</p>
            </div>

            <!-- Error state -->
            <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"><strong>Erreur:</strong> {{ error }}</div>

            <!-- Dashboard content -->
            <div *ngIf="stats && !loading" class="space-y-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <p-card>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-700 mb-2">Budget Total Global</h3>
                            <p class="text-3xl font-bold text-blue-600">{{ formatCurrency(stats.totalBudgetGlobal) }}</p>
                            <p class="text-sm text-gray-500 mt-1">Tous projets confondus</p>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-700 mb-2">Fonds Décaissés</h3>
                            <p class="text-3xl font-bold text-green-600">{{ formatCurrency(stats.totalFondsDecaisses) }}</p>
                            <p class="text-sm text-gray-500 mt-1">{{ stats.tauxDecaissementGlobal }}% du budget total</p>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-700 mb-2">Dépenses Engagées</h3>
                            <p class="text-3xl font-bold text-orange-600">{{ formatCurrency(stats.totalDepensesEngagees) }}</p>
                            <p class="text-sm text-gray-500 mt-1">{{ stats.tauxEngagementGlobal }}% du budget total</p>
                        </div>
                    </p-card>

                    <p-card>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-700 mb-2">Taux de Consommation</h3>
                            <p class="text-3xl font-bold text-purple-600">{{ stats.tauxConsommationGlobal }}%</p>
                            <p class="text-sm text-gray-500 mt-1">Dépenses / Fonds décaissés</p>
                        </div>
                    </p-card>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Répartition par bailleur -->
                    <p-card header="Répartition par Bailleur">
                        <div class="h-80">
                            <p-chart type="doughnut" [data]="repartitionBailleurData" [options]="repartitionBailleurOptions"> </p-chart>
                        </div>
                    </p-card>

                    <!-- Évolution des financements -->
                    <p-card header="Évolution des Financements">
                        <div class="h-80">
                            <p-chart type="line" [data]="evolutionFinancementsData" [options]="evolutionFinancementsOptions"> </p-chart>
                        </div>
                    </p-card>
                </div>

                <!-- Tables Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Top projets par budget -->
                    <p-card header="Top 5 Projets par Budget">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Décaissement</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr *ngFor="let projet of stats.topProjetsParBudget">
                                        <td class="px-4 py-3">
                                            <div class="text-sm font-medium text-gray-900">{{ projet.projet.designation }}</div>
                                            <div class="text-sm text-gray-500">{{ projet.projet.code }}</div>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-900">
                                            {{ formatCurrency(projet.budgetTotalProjet) }}
                                        </td>
                                        <td class="px-4 py-3">
                                            <div class="flex items-center">
                                                <p-progressBar [value]="projet.tauxDecaissement" [style]="{ width: '100px', height: '8px' }" [color]="getProgressColor(projet.tauxDecaissement)"> </p-progressBar>
                                                <span class="ml-2 text-sm text-gray-600">{{ projet.tauxDecaissement }}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </p-card>

                    <!-- Top bailleurs par contribution -->
                    <p-card header="Top 5 Bailleurs par Contribution">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bailleur</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contribution</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Décaissement</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr *ngFor="let bailleur of stats.topBailleursParContribution">
                                        <td class="px-4 py-3">
                                            <div class="text-sm font-medium text-gray-900">{{ bailleur.bailleurDTO.designation }}</div>
                                            <div class="text-sm text-gray-500">{{ bailleur.bailleurDTO.code }}</div>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-900">
                                            {{ formatCurrency(bailleur.financementTotalAttribue) }}
                                        </td>
                                        <td class="px-4 py-3">
                                            <div class="flex items-center">
                                                <p-progressBar [value]="bailleur.tauxGlobalDecaissement" [style]="{ width: '100px', height: '8px' }" [color]="getProgressColor(bailleur.tauxGlobalDecaissement)"> </p-progressBar>
                                                <span class="ml-2 text-sm text-gray-600">{{ bailleur.tauxGlobalDecaissement }}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </p-card>
                </div>

                <!-- Action buttons -->
                <div class="flex justify-center space-x-4">
                    <button (click)="loadMockData()" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">Charger données mockées</button>
                    <button (click)="loadRealData()" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors">Charger données réelles</button>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class FinancementDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Data
    stats: FinancementStats | null = null;
    loading = false;
    error: string | null = null;

    // Chart data
    repartitionBailleurData: any;
    repartitionBailleurOptions: any;
    evolutionFinancementsData: any;
    evolutionFinancementsOptions: any;

    constructor(private financementService: FinancementService) {}

    ngOnInit(): void {
        // Charger les données mockées par défaut
        this.loadMockData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadMockData(): void {
        this.loading = true;
        this.error = null;

        // Utiliser les vraies données du backend
        this.financementService
            .getFinancementStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = stats;
                    this.initializeCharts();
                    this.loading = false;
                },
                error: (err) => {
                    this.error = 'Erreur lors du chargement des données: ' + err.message;
                    this.loading = false;
                }
            });
    }

    loadRealData(): void {
        this.loading = true;
        this.error = null;

        this.financementService
            .getFinancementStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = stats;
                    this.initializeCharts();
                    this.loading = false;
                },
                error: (err) => {
                    this.error = 'Erreur lors du chargement des données réelles: ' + err.message;
                    this.loading = false;
                }
            });
    }

    private initializeCharts(): void {
        if (!this.stats) return;

        // Graphique de répartition par bailleur
        this.repartitionBailleurData = {
            labels: this.stats.repartitionParBailleur.map((b) => b.bailleur),
            datasets: [
                {
                    data: this.stats.repartitionParBailleur.map((b) => b.montant),
                    backgroundColor: this.stats.repartitionParBailleur.map((b) => b.couleur),
                    borderWidth: 0
                }
            ]
        };

        this.repartitionBailleurOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const bailleur = this.stats!.repartitionParBailleur[context.dataIndex];
                            return `${bailleur.bailleur}: ${this.formatCurrency(bailleur.montant)} (${bailleur.pourcentage.toFixed(1)}%)`;
                        }
                    }
                }
            }
        };

        // Graphique d'évolution des financements
        this.evolutionFinancementsData = this.stats.evolutionFinancements;
        this.evolutionFinancementsOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => {
                            return this.formatCurrency(value);
                        }
                    }
                }
            }
        };
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    getProgressColor(value: number): string {
        if (value >= 80) return '#10b981'; // Vert
        if (value >= 60) return '#f59e0b'; // Jaune
        if (value >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Rouge
    }
}
