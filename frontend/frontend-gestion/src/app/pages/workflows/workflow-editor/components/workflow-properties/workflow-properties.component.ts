import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { MessageService } from 'primeng/api';
import { EditorNode, WorkflowNodeType } from '../../../../../core/models/workflow.model';
import { ProjectService } from '../../../../../core/services/project.service';
import { WorkflowService } from '../../../../../core/services/workflow.service';

// ─── Catálogo de tablas conocidas
export interface FieldDef {
    key: string;         // nombre del campo
    label: string;       // etiqueta visible
    type: 'text' | 'email' | 'textarea' | 'date' | 'select'; // tipo de input
    placeholder?: string;
    options?: any[];  // para tipo select
}

export interface TableRecord {
    label: string;
    value: string;
    endpoint: string;
    editableFields: FieldDef[];
    json: Record<string, any>; // esquema interno
}

const KNOWN_TABLES: TableRecord[] = [
    {
        label: 'Usuarios',
        value: 'users',
        endpoint: '/api/v1/users',
        editableFields: [
            { key: 'email', label: 'Email', type: 'email', placeholder: 'usuario@email.com' },
            { key: 'firstName', label: 'Nombre', type: 'text', placeholder: 'Juan' },
            { key: 'lastName', label: 'Apellido', type: 'text', placeholder: 'Pérez' },
        ],
        json: { table: 'user', fields: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'] },
    },
    {
        label: 'Proyectos',
        value: 'projects',
        endpoint: '/api/v1/projects',
        editableFields: [
            { key: 'name', label: 'Nombre del proyecto', type: 'text', placeholder: 'Mi Proyecto' },
            { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del proyecto...' },
            { key: 'startDate', label: 'Fecha de inicio', type: 'date' },
            { key: 'endDate', label: 'Fecha de fin', type: 'date' },
        ],
        json: { table: 'project', fields: ['id', 'name', 'description', 'startDate', 'endDate', 'createdAt'] },
    },
    {
        label: 'Tareas',
        value: 'tasks',
        endpoint: '/api/v1/tasks',
        editableFields: [
            { key: 'title', label: 'Título', type: 'text', placeholder: 'Nueva tarea' },
            { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de la tarea...' },
            { key: 'status', label: 'Estado', type: 'select', options: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'] },
            { key: 'projectId', label: 'ID del Proyecto', type: 'text', placeholder: 'uuid del proyecto' },
        ],
        json: { table: 'task', fields: ['id', 'title', 'description', 'status', 'projectId', 'createdAt'] },
    },
    {
        label: 'Workflows',
        value: 'workflows',
        endpoint: '/api/v1/workflows',
        editableFields: [
            { key: 'title', label: 'Título', type: 'text', placeholder: 'Mi Workflow' },
            { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción...' },
            { key: 'triggerType', label: 'Tipo de trigger', type: 'select', options: ['HTTP', 'WEBHOOK', 'MANUAL'] },
        ],
        json: { table: 'workflow', fields: ['id', 'title', 'description', 'triggerType', 'createdAt'] },
    },
];

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
        AutoCompleteModule,
    ],
    templateUrl: './workflow-properties.component.html',
    styleUrls: []
})
export class WorkflowPropertiesComponent implements OnChanges, OnInit {
    @Input({ required: true }) node!: EditorNode;
    @Input() parentNode: EditorNode | null = null;
    @Output() configChange = new EventEmitter<Record<string, any>>();
    @Output() connectNode = new EventEmitter<EditorNode>();
    @Output() deleteNode = new EventEmitter<EditorNode>();
    @Output() disconnectNode = new EventEmitter<EditorNode>();

    // Advanced JSON
    configJson = signal('{}');
    configValid = signal(true);
    showAdvancedJson = signal(false);

    // Parent Node Data (n8n-style)
    showParentData = signal(true);
    parentFields = signal<{ key: string; value: string; icon: string }[]>([]);

    // Testing variables
    testingHttp = signal(false);
    httpTestResult = signal<string>('');
    testingAction = signal(false);
    actionTestResult = signal<{ raw: any; rows: any[] | null } | null>(null);

    // Form Fields - HTTP
    httpMethod = signal('POST');
    httpUrl = signal('');
    httpBody = signal('');
    httpHeaders = signal('');

    // Form Fields - Webhook
    webhookUrl = signal('');
    webhookPayload = signal('');

    // Form Fields - Notification
    notifRecipient = signal('');
    notifMessage = signal('');

    // Form Fields - Delay
    delayDuration = signal(5);
    delayUnit = signal('seconds');

    // Form Fields - Action (Record)
    recordNombre = signal('');
    recordEndpoint = signal('');
    recordFields = signal<FieldDef[]>([]);   // campos editables de la tabla
    recordData = signal<Record<string, string>>({}); // valores escritos por el usuario
    recordJson = signal<Record<string, any>>({}); // JSON interno del esquema
    recordSuggestions = signal<TableRecord[]>([]);

    // Form Fields - Form node
    formTitle = signal('');
    formFields = signal<Array<{ name: string; type: string; required: boolean }>>([]);

    readonly knownTables = KNOWN_TABLES;

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
    fieldTypes = [
        { label: 'Texto', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Número', value: 'number' },
        { label: 'Fecha', value: 'date' },
        { label: 'Área de texto', value: 'textarea' },
    ];

    constructor(
        private workflowService: WorkflowService,
        private messageService: MessageService,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.loadProjects();
    }

    private loadProjects() {
        this.projectService.getProjects(1, 100).subscribe({
            next: (res) => {
                const projects = res.data;
                const projectOptions = projects.map(p => ({ label: p.name, value: p.id }));

                const tasksTable = KNOWN_TABLES.find(t => t.value === 'tasks');
                if (tasksTable) {
                    const projectField = tasksTable.editableFields.find(f => f.key === 'projectId');
                    if (projectField) {
                        projectField.type = 'select';
                        projectField.options = projectOptions;
                        projectField.placeholder = 'Selecciona un proyecto...';

                        if (this.recordNombre() === tasksTable.label) {
                            this.recordFields.set([...tasksTable.editableFields]);
                        }
                    }
                }
            },
            error: (err) => console.error('Error cargando proyectos para dropdown', err)
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes['node'] && this.node) || (changes['parentNode'])) {
            const currentConfig = this.node.config || {};
            this.configJson.set(JSON.stringify(currentConfig, null, 2));
            this.configValid.set(true);
            this.httpTestResult.set('');
            this.actionTestResult.set(null);
            this.syncJsonToForm(currentConfig, this.node.type);
            this.updateParentFields();
        }
    }

    private updateParentFields() {
        if (!this.parentNode || !this.parentNode.config) {
            this.parentFields.set([]);
            return;
        }

        const config = this.parentNode.config;
        const type = this.parentNode.type;
        const fields: { key: string; value: string; icon: string }[] = [];

        switch (type) {
            case WorkflowNodeType.HTTP:
                if (config['url']) fields.push({ key: 'url', value: config['url'], icon: 'pi-link' });
                if (config['method']) fields.push({ key: 'method', value: config['method'], icon: 'pi-cog' });
                if (config['body']) fields.push({ key: 'body', value: typeof config['body'] === 'string' ? config['body'] : JSON.stringify(config['body']), icon: 'pi-box' });
                if (config['headers']) fields.push({ key: 'headers', value: typeof config['headers'] === 'string' ? config['headers'] : JSON.stringify(config['headers']), icon: 'pi-list' });
                break;
            case WorkflowNodeType.WEBHOOK:
                if (config['url']) fields.push({ key: 'url', value: config['url'], icon: 'pi-link' });
                if (config['payload']) fields.push({ key: 'payload', value: typeof config['payload'] === 'string' ? config['payload'] : JSON.stringify(config['payload']), icon: 'pi-box' });
                break;
            case WorkflowNodeType.ACTION:
                if (config['nombre']) fields.push({ key: 'nombre', value: config['nombre'], icon: 'pi-table' });
                if (config['endpoint']) fields.push({ key: 'endpoint', value: config['endpoint'], icon: 'pi-link' });
                if (config['data']) fields.push({ key: 'data', value: JSON.stringify(config['data']), icon: 'pi-box' });
                break;
            case WorkflowNodeType.FORM:
                if (config['title']) fields.push({ key: 'title', value: config['title'], icon: 'pi-align-left' });
                if (Array.isArray(config['fields'])) {
                    config['fields'].forEach((f: any) => {
                        fields.push({ key: f.name, value: `(tipo: ${f.type})`, icon: 'pi-id-card' });
                    });
                }
                break;
            default:
                for (const [key, value] of Object.entries(config)) {
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        fields.push({ key, value: String(value), icon: 'pi-hashtag' });
                    }
                }
                break;
        }

        this.parentFields.set(fields);
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
                    nombre: this.recordNombre(),
                    endpoint: this.recordEndpoint(),
                    data: this.recordData(),     // valores del registro
                    json: this.recordJson(),     // esquema interno
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
                this.recordNombre.set(config['nombre'] || '');
                this.recordEndpoint.set(config['endpoint'] || '');
                this.recordJson.set(config['json'] || {});
                this.recordData.set(config['data'] || {});
                // Restaurar la definición de campos desde la tabla conocida
                const savedTable = KNOWN_TABLES.find(t => t.label === config['nombre'] || t.endpoint === config['endpoint']);
                this.recordFields.set(savedTable ? savedTable.editableFields : []);
                break;
            case WorkflowNodeType.FORM:
                this.formTitle.set(config['title'] || '');
                this.formFields.set(config['fields'] || []);
                break;
        }
    }

    /** Cuando se selecciona una tabla del autocomplete */
    onTableSelect(table: TableRecord) {
        this.recordNombre.set(table.label);
        this.recordEndpoint.set(table.endpoint);
        this.recordFields.set(table.editableFields);
        this.recordJson.set(table.json);
        // Inicializar recordData con claves vacías para los campos editables
        const emptyData: Record<string, string> = {};
        table.editableFields.forEach(f => { emptyData[f.key] = ''; });
        this.recordData.set(emptyData);
        this.actionTestResult.set(null);
        this.onFormFieldChange();
    }

    /** Cuando se escribe manualmente en el campo Nombre */
    onNombreInput(value: string) {
        this.recordNombre.set(value);
        // Si el texto coincide con una tabla conocida, auto-rellenar
        const match = KNOWN_TABLES.find(t => t.label.toLowerCase() === value.toLowerCase());
        if (match) {
            this.onTableSelect(match);
            return;
        }
        this.onFormFieldChange();
    }

    /** Filtrar sugerencias del autocomplete */
    filterTables(event: { query: string }) {
        const q = event.query.toLowerCase();
        this.recordSuggestions.set(
            KNOWN_TABLES.filter(t =>
                t.label.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
            )
        );
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

    testActionNode() {
        if (!this.recordEndpoint()) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar una tabla o ingresar un endpoint' });
            return;
        }

        this.testingAction.set(true);
        this.actionTestResult.set(null);

        this.workflowService.testAction({
            nombre: this.recordNombre(),
            endpoint: this.recordEndpoint(),
            json: this.recordJson(),
        }).subscribe({
            next: (res) => {
                const rows = Array.isArray(res.data) ? res.data : null;
                this.actionTestResult.set({ raw: res, rows });
                this.testingAction.set(false);
            },
            error: (err) => {
                const errMsg = err.error?.message || err.message || 'Error en la acción';
                this.actionTestResult.set({ raw: { error: errMsg }, rows: null });
                this.testingAction.set(false);
            }
        });
    }

    updateRecordField(key: string, value: string) {
        this.recordData.update(d => ({ ...d, [key]: value }));
        this.onFormFieldChange();
    }

    getActionResultColumns(): string[] {
        const result = this.actionTestResult();
        if (!result?.rows?.length) return [];
        // Filtrar columnas al esquema definido para la tabla
        const schemaKeys = this.recordFields().map(f => f.key);
        const allCols = Object.keys(result.rows[0]);
        return schemaKeys.length > 0 ? allCols.filter(c => schemaKeys.includes(c)) : allCols;
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

    // ==================== Parent Node Data ====================

    getParentFields = computed(() => {
        if (!this.parentNode || !this.parentNode.config) return [];

        const config = this.parentNode.config;
        const type = this.parentNode.type;
        const fields: { key: string; value: string; icon: string }[] = [];

        switch (type) {
            case WorkflowNodeType.HTTP:
                if (config['url']) fields.push({ key: 'url', value: config['url'], icon: 'pi-link' });
                if (config['method']) fields.push({ key: 'method', value: config['method'], icon: 'pi-cog' });
                if (config['body']) fields.push({ key: 'body', value: typeof config['body'] === 'string' ? config['body'] : JSON.stringify(config['body']), icon: 'pi-box' });
                if (config['headers']) fields.push({ key: 'headers', value: typeof config['headers'] === 'string' ? config['headers'] : JSON.stringify(config['headers']), icon: 'pi-list' });
                break;
            case WorkflowNodeType.WEBHOOK:
                if (config['url']) fields.push({ key: 'url', value: config['url'], icon: 'pi-link' });
                if (config['payload']) fields.push({ key: 'payload', value: typeof config['payload'] === 'string' ? config['payload'] : JSON.stringify(config['payload']), icon: 'pi-box' });
                break;
            case WorkflowNodeType.ACTION:
                if (config['nombre']) fields.push({ key: 'nombre', value: config['nombre'], icon: 'pi-table' });
                if (config['endpoint']) fields.push({ key: 'endpoint', value: config['endpoint'], icon: 'pi-link' });
                if (config['data']) fields.push({ key: 'data', value: JSON.stringify(config['data']), icon: 'pi-box' });
                break;
            case WorkflowNodeType.FORM:
                if (config['title']) fields.push({ key: 'title', value: config['title'], icon: 'pi-align-left' });
                if (Array.isArray(config['fields'])) {
                    config['fields'].forEach((f: any) => {
                        fields.push({ key: f.name, value: `(tipo: ${f.type})`, icon: 'pi-id-card' });
                    });
                }
                break;
            default:
                for (const [key, value] of Object.entries(config)) {
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        fields.push({ key, value: String(value), icon: 'pi-hashtag' });
                    }
                }
                break;
        }

        return fields;
    });

    onFieldDragStart(event: DragEvent, fieldKey: string) {
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', `{{ ${fieldKey} }}`);
            event.dataTransfer.effectAllowed = 'copy';
        }
    }
}
