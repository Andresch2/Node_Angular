import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { MessageService } from 'primeng/api';
import { EditorNode, WorkflowNodeType } from '../../../../../core/models/workflow.model';
import { WorkflowService } from '../../../../../core/services/workflow.service';

@Component({
    selector: 'app-workflow-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        CheckboxModule,
        TagModule,
    ],
    templateUrl: './workflow-properties.component.html',
    styleUrls: []
})
export class WorkflowPropertiesComponent implements OnChanges {
    @Input({ required: true }) node!: EditorNode;
    @Output() configChange = new EventEmitter<Record<string, any>>();
    @Output() connectNode = new EventEmitter<EditorNode>();
    @Output() deleteNode = new EventEmitter<EditorNode>();
    @Output() disconnectNode = new EventEmitter<EditorNode>();

    // Advanced JSON
    configJson = signal('{}');
    configValid = signal(true);
    showAdvancedJson = signal(false);

    // Testing variables
    testingHttp = signal(false);
    httpTestResult = signal<string>('');

    // Form Fields (using signals internally for reactivity)
    httpMethod = signal('POST');
    httpUrl = signal('');
    httpBody = signal('');
    httpHeaders = signal('');
    webhookUrl = signal('');
    webhookPayload = signal('');
    notifRecipient = signal('');
    notifMessage = signal('');
    delayDuration = signal(5);
    delayUnit = signal('seconds');
    actionType = signal('log');
    actionParams = signal('');
    formTitle = signal('');
    formFields = signal<Array<{ name: string; type: string; required: boolean }>>([]);

    httpMethods = [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
    ];
    delayUnits = [
        { label: 'Segundos', value: 'seconds' },
        { label: 'Minutos', value: 'minutes' },
        { label: 'Horas', value: 'hours' },
    ];
    actionTypes = [
        { label: 'Log (Registrar)', value: 'log' },
        { label: 'Transform (Transformar)', value: 'transform' },
        { label: 'Custom (Personalizado)', value: 'custom' },
    ];
    fieldTypes = [
        { label: 'Texto', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Número', value: 'number' },
        { label: 'Fecha', value: 'date' },
        { label: 'Área de texto', value: 'textarea' },
    ];

    constructor(
        private workflowService: WorkflowService,
        private messageService: MessageService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['node'] && this.node) {
            const currentConfig = this.node.config || {};
            this.configJson.set(JSON.stringify(currentConfig, null, 2));
            this.configValid.set(true);
            this.httpTestResult.set('');
            this.syncJsonToForm(currentConfig, this.node.type);
        }
    }

    onConfigChange(value: string) {
        this.configJson.set(value);
        try {
            const parsed = JSON.parse(value);
            this.configValid.set(true);
            this.syncJsonToForm(parsed, this.node.type);
            this.configChange.emit(parsed);
        } catch {
            this.configValid.set(false);
        }
    }

    onFormFieldChange() {
        let config: Record<string, any> = {};

        switch (this.node.type) {
            case WorkflowNodeType.HTTP:
                config = {
                    method: this.httpMethod(),
                    url: this.httpUrl(),
                    ...(this.httpMethod() !== 'GET' && this.httpBody() ? { body: this.safeParseJson(this.httpBody()) } : {}),
                    ...(this.httpHeaders() ? { headers: this.safeParseJson(this.httpHeaders()) } : {}),
                };
                break;
            case WorkflowNodeType.WEBHOOK:
                config = {
                    url: this.webhookUrl(),
                    ...(this.webhookPayload() ? { payload: this.safeParseJson(this.webhookPayload()) } : {}),
                };
                break;
            case WorkflowNodeType.NOTIFICATION:
                config = {
                    recipient: this.notifRecipient(),
                    message: this.notifMessage(),
                };
                break;
            case WorkflowNodeType.DELAY:
                config = {
                    duration: this.delayDuration(),
                    unit: this.delayUnit(),
                };
                break;
            case WorkflowNodeType.ACTION:
                config = {
                    action: this.actionType(),
                    ...(this.actionParams() ? { message: this.actionParams() } : {}),
                };
                break;
            case WorkflowNodeType.FORM:
                config = {
                    title: this.formTitle(),
                    fields: this.formFields(),
                };
                break;
        }

        this.configJson.set(JSON.stringify(config, null, 2));
        this.configValid.set(true);
        this.configChange.emit(config);
    }

    private syncJsonToForm(config: Record<string, any>, type: WorkflowNodeType) {
        switch (type) {
            case WorkflowNodeType.HTTP:
                this.httpMethod.set((config['method'] || 'POST').toUpperCase());
                this.httpUrl.set(config['url'] || '');
                this.httpBody.set(config['body'] ? (typeof config['body'] === 'string' ? config['body'] : JSON.stringify(config['body'], null, 2)) : '');
                this.httpHeaders.set(config['headers'] ? (typeof config['headers'] === 'string' ? config['headers'] : JSON.stringify(config['headers'], null, 2)) : '');
                break;
            case WorkflowNodeType.WEBHOOK:
                this.webhookUrl.set(config['url'] || '');
                this.webhookPayload.set(config['payload'] ? (typeof config['payload'] === 'string' ? config['payload'] : JSON.stringify(config['payload'], null, 2)) : '');
                break;
            case WorkflowNodeType.NOTIFICATION:
                this.notifRecipient.set(config['recipient'] || '');
                this.notifMessage.set(config['message'] || '');
                break;
            case WorkflowNodeType.DELAY:
                this.delayDuration.set(config['duration'] || 5);
                this.delayUnit.set(config['unit'] || 'seconds');
                break;
            case WorkflowNodeType.ACTION:
                this.actionType.set(config['action'] || 'log');
                this.actionParams.set(config['message'] || config['params'] || '');
                break;
            case WorkflowNodeType.FORM:
                this.formTitle.set(config['title'] || '');
                this.formFields.set(config['fields'] || []);
                break;
        }
    }

    private safeParseJson(value: string): any {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    addFormField() {
        this.formFields.update(fields => [...fields, { name: '', type: 'text', required: false }]);
        this.onFormFieldChange();
    }

    removeFormField(index: number) {
        this.formFields.update(fields => fields.filter((_, i) => i !== index));
        this.onFormFieldChange();
    }

    updateFormField(index: number, key: 'name' | 'type' | 'required', value: any) {
        this.formFields.update(fields =>
            fields.map((f, i) => i === index ? { ...f, [key]: value } : f),
        );
        this.onFormFieldChange();
    }

    testHttpNode() {
        if (!this.httpUrl()) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe especificar una URL' });
            return;
        }

        this.testingHttp.set(true);
        const config = {
            method: this.httpMethod(),
            url: this.httpUrl(),
            ...(this.httpBody() && this.httpMethod() !== 'GET' ? { body: this.safeParseJson(this.httpBody()) } : {}),
            ...(this.httpHeaders() ? { headers: this.safeParseJson(this.httpHeaders()) } : {}),
        };

        this.workflowService.testHttpNode(config).subscribe({
            next: (res) => {
                this.httpTestResult.set(JSON.stringify(res.data, null, 2));
                this.testingHttp.set(false);
            },
            error: (err) => {
                const errMsg = err.error?.error || err.message || 'Error en la petición';
                this.httpTestResult.set(JSON.stringify({ error: errMsg }, null, 2));
                this.testingHttp.set(false);
            }
        });
    }

    getNodeLabel(type: WorkflowNodeType): string {
        switch (type) {
            case WorkflowNodeType.TRIGGER: return 'Trigger';
            case WorkflowNodeType.HTTP: return 'HTTP';
            case WorkflowNodeType.WEBHOOK: return 'Webhook';
            case WorkflowNodeType.ACTION: return 'Action';
            case WorkflowNodeType.NOTIFICATION: return 'Notificación';
            case WorkflowNodeType.DELAY: return 'Delay';
            case WorkflowNodeType.FORM: return 'Formulario';
            default: return 'Desconocido';
        }
    }

    getNodeColor(type: WorkflowNodeType): string {
        switch (type) {
            case WorkflowNodeType.TRIGGER: return '#6366f1';
            case WorkflowNodeType.HTTP: return '#22c55e';
            case WorkflowNodeType.WEBHOOK: return '#f59e0b';
            case WorkflowNodeType.ACTION: return '#3b82f6';
            case WorkflowNodeType.NOTIFICATION: return '#10b981';
            case WorkflowNodeType.DELAY: return '#ef4444';
            case WorkflowNodeType.FORM: return '#8b5cf6';
            default: return '#6b7280';
        }
    }
}
