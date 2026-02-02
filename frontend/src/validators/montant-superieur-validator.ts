import { AbstractControl } from '@angular/forms';

export class MontantSuperieurValidators {
    static budgetSupMontantValidator(group: AbstractControl) {
        const budget = group.get('budgetProjet')?.value;
        const montant = group.get('montantDonne')?.value;

        if (budget != null && montant != null && budget <= montant) {
            return { budgetInferieur: true };
        }
        return null;
    }
}
