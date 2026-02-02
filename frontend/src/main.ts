import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { L10n, registerLicense, setCulture } from '@syncfusion/ej2-base';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

L10n.load({
    'fr-FR': {
        gantt: {
            emptyRecord: 'Aucun enregistrement à afficher',
            id: 'ID',
            name: 'Nom de la tâche',
            startDate: 'Date de début',
            endDate: 'Date de fin',
            duration: 'Durée',
            progress: 'Avancement',
            dependency: 'Dépendance',
            baselineStartDate: 'Début de référence',
            baselineEndDate: 'Fin de référence',
            taskMode: 'Mode tâche',
            resourceInfo: 'Ressources'
            // 👉 ajoute les clés qui t’intéressent
        },
        calendar: {
            day: 'Jour',
            week: 'Semaine',
            month: 'Mois',
            today: "Aujourd'hui",
            shortDay: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            longDay: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            shortMonth: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
            longMonth: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        }
    }
});
registerLocaleData(localeFr);
setCulture('fr-FR');
// registerLicense('Ngo9BigBOggjHTQxAR8/V1JEaF1cWWhBYVF1WmFZfVtgfF9CZlZURmYuP1ZhSXxWdk1iX39WdHJQRGZZVEB9XEI= ');
registerLicense('ORg4AjUWIQA/Gnt3VVhhQlJDfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5bd01jXH9XcnxWR2RbWkd2');
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
