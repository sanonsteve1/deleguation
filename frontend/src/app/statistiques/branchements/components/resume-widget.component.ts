import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-resume-widget',
    standalone: true,
    imports: [CommonModule, CardModule],
    template: `
        <div class="grid">
            <!-- Total Branchements -->
            <div class="col-12 lg:col-4">
                <div class="card mb-0">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Total Branchements</span>
                            <div class="text-900 font-medium text-xl">
                                {{ totalBranchements | number: '1.0-0' : 'fr-FR' }}
                            </div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-th-large text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-green-500 font-medium">{{ nombreRegions }} régions </span>
                    <span class="text-500">analysées</span>
                </div>
            </div>

            <!-- Agences -->
            <div class="col-12 lg:col-4">
                <div class="card mb-0">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Agences Actives</span>
                            <div class="text-900 font-medium text-xl">
                                {{ nombreAgences | number: '1.0-0' : 'fr-FR' }}
                            </div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-building text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-green-500 font-medium">Réparties </span>
                    <span class="text-500">sur tout le territoire</span>
                </div>
            </div>

            <!-- Types Ampérage -->
            <div class="col-12 lg:col-4">
                <div class="card mb-0">
                    <div class="flex justify-content-between mb-3">
                        <div>
                            <span class="block text-500 font-medium mb-3">Types d'Ampérage</span>
                            <div class="text-900 font-medium text-xl">{{ nombreAmperages }}</div>
                        </div>
                        <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
                            <i class="pi pi-bolt text-cyan-500 text-xl"></i>
                        </div>
                    </div>
                    <span class="text-green-500 font-medium">Configurations </span>
                    <span class="text-500">disponibles</span>
                </div>
            </div>
        </div>
    `
})
export class ResumeWidgetComponent {
    @Input() totalBranchements: number = 0;
    @Input() nombreRegions: number = 0;
    @Input() nombreAgences: number = 0;
    @Input() nombreAmperages: number = 0;
}
