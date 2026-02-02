import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '@/layout/service/layout.service';
import { SHA1, VERSION } from '../../../../environments/version';
import { NgClass } from '@angular/common';
@Component({
    standalone: true,
    selector: '[app-footer]',
    imports: [ButtonModule, NgClass],
    template: ` <div class="flex justify-start items-center">
            <span
                class="titre-logo"
                [ngClass]="{
                    'text-white': layoutService.isDarkTheme(),
                    'text-blue-600': !layoutService.isDarkTheme(),
                    'titre-slim-plus': layoutService.isSlimPlus(),
                    'titre-slim': layoutService.isSlim(),
                    'titre-normal': !layoutService.isSlim() && !layoutService.isSlimPlus()
                }"
            >
                {{ layoutService.isSlimPlus() ? 'ABLink' : 'ABLink' }}
            </span>
        </div>
        <div class="flex gap-0 items-center">
            <small>Développé par <a href="https://eburtis.com/" target="_blank">EBURTIS</a></small>
            <!--
				<button pButton icon="fa fa-code-fork" rounded text severity="secondary"></button>
				<span class="version-info">{{ VERSION }} - {{ SHA1 }}</span>
			-->
        </div>`,
    host: {
        class: 'layout-footer'
    },
    styles: `
        .titre-logo {
            font-family: 'Bauhaus 93', serif;
            font-weight: normal;
            font-size: 20px;
            transition: all 0.3s ease;
            white-space: nowrap;
            overflow: hidden;
        }

        .titre-slim-plus {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .titre-slim {
            font-size: 16px;
            font-weight: bold;
        }

        .titre-normal {
            font-size: 20px;
        }

        .version-info {
            font-size: 12px;
            opacity: 0.8;
        }

        .layout-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            width: 100%;
        }

        @media (max-width: 768px) {
            .titre-slim-plus {
                font-size: 16px;
            }

            .titre-slim {
                font-size: 14px;
            }

            .titre-normal {
                font-size: 18px;
            }
        }
    `
})
export class AppFooter {
    layoutService = inject(LayoutService);
    protected readonly VERSION = VERSION;
    protected readonly SHA1 = SHA1;
}
