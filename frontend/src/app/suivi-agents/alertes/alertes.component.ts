import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-alertes',
    standalone: true,
    imports: [CommonModule, CardModule],
    template: `
        <div class="alertes-container">
            <h1 class="text-3xl font-bold mb-4">Alertes</h1>
            <p-card>
                <p class="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
            </p-card>
        </div>
    `,
    styles: [`
        .alertes-container {
            padding: 1.5rem;
        }
    `]
})
export class AlertesComponent {}
