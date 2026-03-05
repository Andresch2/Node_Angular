import { environment } from '@/environments/environment';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { EditorNode } from '../../../../../../core/models/workflow.model';

@Component({
    selector: 'app-webhook-properties',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, ButtonModule, TooltipModule],
    template: `
    <div class="form-section">
        <h5><i class="pi pi-inbox"></i> Webhook Trigger</h5>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; line-height: 1.5;">
            Configura esta URL en tu sistema externo (Shopify, Github, Stripe, etc.) como endpoint de webhook.
            Cuando hagan <strong>POST</strong> a esta URL, el workflow se ejecutará automáticamente con el payload recibido.
        </p>

        <div class="form-group">
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #e2e8f0;">
                <i class="pi pi-link" style="margin-right: 0.3rem;"></i> URL del Webhook
            </label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input pInputText
                    [value]="webhookUrl()"
                    readonly
                    class="w-full"
                    style="font-family: monospace; font-size: 0.85rem; background: #0f172a; border: 1px solid #334155; color: #e2e8f0; cursor: text;" />
                <p-button
                    icon="pi pi-copy"
                    size="small"
                    severity="secondary"
                    pTooltip="Copiar URL"
                    tooltipPosition="top"
                    (onClick)="copyUrl()" />
            </div>
        </div>

        @if (copied()) {
            <div style="margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: #064e3b; border-radius: 6px; font-size: 0.8rem; color: #6ee7b7; display: flex; align-items: center; gap: 0.4rem;">
                <i class="pi pi-check-circle"></i> URL copiada al portapapeles
            </div>
        }

        <div style="margin-top: 1.25rem; padding: 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 8px;">
            <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                <i class="pi pi-info-circle" style="margin-right: 0.3rem; color: #3b82f6;"></i>
                <strong style="color: #e2e8f0;">Método:</strong> POST &nbsp;|&nbsp;
                <strong style="color: #e2e8f0;">Content-Type:</strong> application/json
            </p>
            <p style="color: #64748b; font-size: 0.75rem; margin: 0.5rem 0 0 0;">
                Este nodo actúa como punto de entrada. No requiere configuración adicional.
                El payload enviado por el sistema externo estará disponible directamente en los nodos siguientes.
            </p>
        </div>

        <div class="form-group" style="margin-top: 1.5rem;">
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #e2e8f0;">
                <i class="pi pi-code" style="margin-right: 0.3rem;"></i> JSON Resultante (Esquema de Variables)
            </label>
            <textarea pTextarea [ngModel]="sampleJsonText()" (ngModelChange)="onSampleJsonChange($event)"
                placeholder='{ "id": 123, "data": "test" }' rows="6" class="w-full"
                style="background: #0f172a; border: 1px solid #334155; color: #e2e8f0; font-family: monospace;"></textarea>
            @if (jsonError()) {
                <small style="color: #ef4444; font-size: 0.75rem; display: block; margin-top: 0.4rem;">
                    <i class="pi pi-exclamation-triangle"></i> Formato JSON inválido.
                </small>
            } @else {
                <small style="color: #64748b; font-size: 0.75rem; display: block; margin-top: 0.4rem;">
                    Pega un evento JSON de prueba real. Automáticamente aparecerá un árbol interactivo para que arrastres
                    sus propiedades en los paneles inferiores.
                </small>
            }
        </div>
    </div>
  `
})
export class WebhookPropertiesComponent implements OnChanges {
    @Input({ required: true }) node!: EditorNode;
    @Input() availableAncestors: EditorNode[] = [];
    @Output() configChange = new EventEmitter<Record<string, any>>();

    private messageService = inject(MessageService);

    webhookUrl = signal('');
    copied = signal(false);
    sampleJsonText = signal('');
    jsonError = signal(false);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['node'] && this.node) {
            const baseUrl = environment.apiUrl;
            this.webhookUrl.set(`${baseUrl}/workflows/webhook/${this.node.workflowId}`);
            this.copied.set(false);

            const config = this.node.config || {};
            if (config['sampleJson']) {
                this.sampleJsonText.set(typeof config['sampleJson'] === 'string' ? config['sampleJson'] : JSON.stringify(config['sampleJson'], null, 2));
            } else {
                this.sampleJsonText.set('');
            }
        }
    }

    onSampleJsonChange(val: string) {
        this.sampleJsonText.set(val);
        try {
            if (val.trim() === '') {
                this.jsonError.set(false);
                this.emitConfig();
                return;
            }
            JSON.parse(val);
            this.jsonError.set(false);
            this.emitConfig();
        } catch {
            this.jsonError.set(true);
        }
    }

    private emitConfig() {
        let sampleJson = null;
        if (this.sampleJsonText().trim() !== '' && !this.jsonError()) {
            try { sampleJson = JSON.parse(this.sampleJsonText()); } catch { }
        }

        const newConfig = { ...this.node.config };

        if (sampleJson) {
            newConfig['sampleJson'] = sampleJson;
        } else {
            delete newConfig['sampleJson'];
        }

        this.configChange.emit(newConfig);
    }

    async copyUrl() {
        try {
            await navigator.clipboard.writeText(this.webhookUrl());
            this.copied.set(true);
            this.messageService.add({
                severity: 'success',
                summary: 'URL Copiada',
                detail: 'URL del webhook copiada al portapapeles',
                life: 2000,
            });
            setTimeout(() => this.copied.set(false), 3000);
        } catch {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo copiar la URL',
            });
        }
    }
}
