import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    // TODO A implémenter selon ANgular 17
    // @ts-ignore
    static notBlank(control: AbstractControl): ValidationErrors | null {
        if (!(control.value as string)?.trim().length) {
            return { spaceOnly: true };
        }

        return null;
    }

    static number(control: AbstractControl): ValidationErrors | null {
        if (!(control.value as string)?.trim().length) {
            return { spaceOnly: true };
        }

        return null;
    }

    static dateRangeValidator(dateDebutField: string): ValidatorFn {
        return (control: AbstractControl) => {
            if (!control.parent) return null;
            const dateDebut = control.parent.get(dateDebutField)?.value;
            const dateFin = control.value;

            if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
                return { dateRangeInvalid: true };
            }
            return null;
        };
    }
    //
    // public static matchValues(matchTo: string): (AbstractControl) => ValidationErrors | null {
    // 	return (control: AbstractControl): ValidationErrors | null => {
    // 		return !!control.parent && !!control.parent.value && control.value === control.parent.controls[matchTo].value ? null : {isMatching: false};
    // 	};
    // }
    //
    // public static validateAge(minDate: Date, maxDate: Date): (AbstractControl) => ValidationErrors | null {
    // 	return (control: AbstractControl): ValidationErrors | null => {
    // 		let valid = false;
    // 		if (control.value) {
    // 			const date = moment(control.value.replaceAll(' / ', '/'), 'DD/MM/YYYY', true);
    //
    // 			valid = date.isValid() && date.isSameOrAfter(minDate) && date.isSameOrBefore(maxDate);
    // 			return valid ? null : {dateInvalide: true};
    // 		}
    // 	}
    // }
}
