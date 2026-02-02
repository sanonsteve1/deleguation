import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-taux-recouvrement',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="taux-recouvrement-container">
			<div class="page-header">
				<h1>Taux de recouvrement</h1>
				<p>Analyse des taux de recouvrement des créances</p>
			</div>

			<div class="content-placeholder">
				<div class="placeholder-icon">
					<i class="pi pi-percentage"></i>
				</div>
				<h3>Module Taux de Recouvrement</h3>
				<p>Ce module affichera les données de taux de recouvrement</p>
				<div class="placeholder-features">
					<div class="feature-item">
						<i class="pi pi-check"></i>
						<span>Graphiques de taux</span>
					</div>
					<div class="feature-item">
						<i class="pi pi-check"></i>
						<span>Évolution temporelle</span>
					</div>
					<div class="feature-item">
						<i class="pi pi-check"></i>
						<span>Comparaisons par zone</span>
					</div>
					<div class="feature-item">
						<i class="pi pi-check"></i>
						<span>Alertes de seuil</span>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.taux-recouvrement-container {
			padding: 2rem;
			max-width: 1200px;
			margin: 0 auto;
		}

		.page-header {
			margin-bottom: 2rem;
			text-align: center;
		}

		.page-header h1 {
			font-size: 2rem;
			font-weight: 700;
			color: var(--text-color);
			margin: 0 0 0.5rem 0;
		}

		.page-header p {
			font-size: 1.1rem;
			color: var(--text-color-secondary);
			margin: 0;
		}

		.content-placeholder {
			background: var(--surface-card);
			border-radius: 12px;
			padding: 3rem 2rem;
			text-align: center;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}

		.placeholder-icon {
			margin-bottom: 1.5rem;
		}

		.placeholder-icon i {
			font-size: 4rem;
			color: var(--primary-color);
		}

		.content-placeholder h3 {
			font-size: 1.5rem;
			font-weight: 600;
			color: var(--text-color);
			margin: 0 0 1rem 0;
		}

		.content-placeholder p {
			font-size: 1rem;
			color: var(--text-color-secondary);
			margin: 0 0 2rem 0;
		}

		.placeholder-features {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1rem;
			margin-top: 2rem;
		}

		.feature-item {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			padding: 1rem;
			background: var(--surface-50);
			border-radius: 8px;
			border-left: 4px solid var(--primary-color);
		}

		.feature-item i {
			color: var(--green-500);
			font-size: 1.2rem;
		}

		.feature-item span {
			font-weight: 500;
			color: var(--text-color);
		}
	`]
})
export class TauxRecouvrement1Component {}
