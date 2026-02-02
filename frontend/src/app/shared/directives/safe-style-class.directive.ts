import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appSafeStyleClass]',
    standalone: true
})
export class SafeStyleClassDirective implements OnInit, OnDestroy {
    @Input() appSafeStyleClass: string = '';
    @Input() enterFromClass: string = '';
    @Input() enterActiveClass: string = '';
    @Input() leaveToClass: string = '';
    @Input() leaveActiveClass: string = '';
    @Input() hideOnOutsideClick: boolean = true;

    private clickListener?: () => void;
    private outsideClickListener?: () => void;
    private isToggled = false;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        try {
            this.setupClickListener();
        } catch (error) {
            console.warn('SafeStyleClass: Error during initialization', error);
        }
    }

    ngOnDestroy() {
        this.cleanup();
    }

    private setupClickListener() {
        this.clickListener = this.renderer.listen(this.el.nativeElement, 'click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.toggle();
        });
    }

    private toggle() {
        try {
            const target = this.getTargetElement();
            if (!target) {
                console.warn('SafeStyleClass: Target element not found');
                return;
            }

            if (this.isToggled) {
                this.hide(target);
            } else {
                this.show(target);
            }

            this.isToggled = !this.isToggled;
        } catch (error) {
            console.warn('SafeStyleClass: Error during toggle', error);
        }
    }

    private getTargetElement(): Element | null {
        try {
            if (this.appSafeStyleClass === '@next') {
                return this.el.nativeElement.nextElementSibling;
            }
            // Ajouter d'autres sélecteurs si nécessaire
            return document.querySelector(this.appSafeStyleClass);
        } catch (error) {
            console.warn('SafeStyleClass: Error finding target element', error);
            return null;
        }
    }

    private show(target: Element) {
        if (this.enterFromClass) {
            this.renderer.removeClass(target, this.enterFromClass);
        }
        if (this.enterActiveClass) {
            this.renderer.addClass(target, this.enterActiveClass);
        }
        this.renderer.removeClass(target, 'hidden');

        if (this.hideOnOutsideClick) {
            this.setupOutsideClickListener(target);
        }
    }

    private hide(target: Element) {
        if (this.leaveActiveClass) {
            this.renderer.addClass(target, this.leaveActiveClass);
        }
        if (this.leaveToClass) {
            this.renderer.addClass(target, this.leaveToClass);
        }

        // Délai pour l'animation
        setTimeout(() => {
            this.renderer.addClass(target, 'hidden');
            if (this.leaveActiveClass) {
                this.renderer.removeClass(target, this.leaveActiveClass);
            }
            if (this.leaveToClass) {
                this.renderer.removeClass(target, this.leaveToClass);
            }
        }, 150);

        this.removeOutsideClickListener();
    }

    private setupOutsideClickListener(target: Element) {
        this.removeOutsideClickListener();

        setTimeout(() => {
            this.outsideClickListener = this.renderer.listen('document', 'click', (event) => {
                if (!this.el.nativeElement.contains(event.target) && !target.contains(event.target)) {
                    this.hide(target);
                    this.isToggled = false;
                }
            });
        }, 100);
    }

    private removeOutsideClickListener() {
        if (this.outsideClickListener) {
            this.outsideClickListener();
            this.outsideClickListener = undefined;
        }
    }

    private cleanup() {
        if (this.clickListener) {
            this.clickListener();
        }
        this.removeOutsideClickListener();
    }
}
