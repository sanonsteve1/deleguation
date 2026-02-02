import { Validators } from '@angular/forms';

export class RequiredValidators {
    /**
     * Validateur considérant que le formcontrol est obligatoire si un prédicat est vérifié
     * @param predicate le prédicat
     */
    static requiredIf(predicate: Function | boolean) {
        return (formControl) => {
            if (!formControl.parent) {
                return null;
            }
            const required: boolean = typeof predicate === 'function' ? predicate() : predicate;
            if (required) {
                return Validators.required(formControl);
            }
            return null;
        };
    }
}
