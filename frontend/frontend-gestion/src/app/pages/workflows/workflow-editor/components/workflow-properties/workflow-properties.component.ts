import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TreeModule } from 'primeng/tree';

import { EditorNode, WorkflowNodeType } from '../../../../../core/models/workflow.model';
import { getNodeColor as sharedGetNodeColor, getNodeLabel as sharedGetNodeLabel } from '../../utils/workflow-node.utils';

// Subcomponentes standalone de Propiedades (Fase 3)
import { DatabasePropertiesComponent } from './node-types/database-properties.component';
import { DelayPropertiesComponent } from './node-types/delay-properties.component';
import { FormPropertiesComponent } from './node-types/form-properties.component';
import { HttpPropertiesComponent } from './node-types/http-properties.component';
import { NotificationPropertiesComponent } from './node-types/notification-properties.component';
import { WebhookPropertiesComponent } from './node-types/webhook-properties.component';

@Component({
    selector: 'app-workflow-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        TextareaModule,
        TreeModule,
        // Nodos hijos
        HttpPropertiesComponent,
        DatabasePropertiesComponent,
        DelayPropertiesComponent,
        NotificationPropertiesComponent,
        FormPropertiesComponent,
        WebhookPropertiesComponent
    ],
    templateUrl: './workflow-properties.component.html',
    styleUrls: []
})
export class WorkflowPropertiesComponent implements OnChanges, OnInit {
    @Input({ required: true }) node!: EditorNode;
    @Input() parentNode: EditorNode | null = null;

    // Lista de ancestros (Fase 4). Provisionalmente un arreglo vacío hasta conectar el canvas.
    @Input() availableAncestors: EditorNode[] = [];

    @Output() configChange = new EventEmitter<Record<string, any>>();
    @Output() connectNode = new EventEmitter<EditorNode>();
    @Output() deleteNode = new EventEmitter<EditorNode>();
    @Output() disconnectNode = new EventEmitter<EditorNode>();

    // Advanced JSON
    configJson = signal('{}');
    configValid = signal(true);
    showAdvancedJson = signal(false);

    // Parent Node Data
    ancestorPanels = signal<Array<{
        node: EditorNode,
        expanded: boolean,
        treeNodes: TreeNode[]
    }>>([]);

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['node'] || changes['parentNode'] || changes['availableAncestors']) {
            const currentConfig = this.node?.config || {};
            this.configJson.set(JSON.stringify(currentConfig, null, 2));
            this.configValid.set(true);
            this.updateAncestorPanels();
        }
    }

    private updateAncestorPanels() {
        const panels = [];
        const ancestors = this.availableAncestors && this.availableAncestors.length > 0
            ? this.availableAncestors
            : (this.parentNode ? [this.parentNode] : []);

        for (const ancestor of ancestors) {
            const config = ancestor.config || {};
            let treeNodes: TreeNode[] = [];

            // If the node has a sampleJson property, we generate a tree from it.
            if (config['sampleJson']) {
                try {
                    const parsed = typeof config['sampleJson'] === 'string' ? JSON.parse(config['sampleJson']) : config['sampleJson'];
                    treeNodes = this.buildTree(parsed, '', ancestor.id);
                } catch {
                    treeNodes = [{ label: 'JSON Inválido', icon: 'pi pi-exclamation-triangle', data: { type: 'ERROR' } }];
                }
            } else {
                // Generar árbol simulado para nodos nativos si no hay sampleJson
                switch (ancestor.type) {
                    case WorkflowNodeType.DATABASE:
                        if (config['nombre']) treeNodes.push({ label: 'nombre', icon: 'pi pi-table', key: 'nombre', data: { path: `nodes.${ancestor.id}.data.nombre`, type: 'STRING' }, leaf: true });
                        if (config['endpoint']) treeNodes.push({ label: 'endpoint', icon: 'pi pi-link', key: 'endpoint', data: { path: `nodes.${ancestor.id}.data.endpoint`, type: 'STRING' }, leaf: true });
                        break;
                    case WorkflowNodeType.FORM:
                        if (config['title']) treeNodes.push({ label: 'title', icon: 'pi pi-align-left', key: 'title', data: { path: `nodes.${ancestor.id}.data.title`, type: 'STRING' }, leaf: true });
                        if (Array.isArray(config['fields'])) {
                            const fieldNodes = config['fields'].map((f: any) => ({ label: f.name, icon: 'pi pi-id-card', data: { path: `nodes.${ancestor.id}.data.${f.name}`, type: f.type }, leaf: true }));
                            treeNodes.push({ label: 'fields', icon: 'pi pi-list', expanded: true, children: fieldNodes, data: { type: 'ARRAY' } });
                        }
                        break;
                    default:
                        for (const [key, value] of Object.entries(config)) {
                            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                                treeNodes.push({ label: key, icon: 'pi pi-hashtag', data: { path: `nodes.${ancestor.id}.data.${key}`, type: this.getTypeInfo(value) }, leaf: true });
                            }
                        }
                        break;
                }
            }

            treeNodes.push({ label: 'Objeto Completo', icon: 'pi pi-box', data: { path: `nodes.${ancestor.id}`, type: 'OBJECT' }, leaf: true });

            panels.push({
                node: ancestor,
                // Expandir default el padre inmediato
                expanded: ancestor.id === this.parentNode?.id,
                treeNodes
            });
        }

        this.ancestorPanels.set(panels.reverse()); // mostrar los más recientes (más cercanos) arriba
    }

    togglePanel(panel: any) {
        panel.expanded = !panel.expanded;
        this.ancestorPanels.set([...this.ancestorPanels()]);
    }

    /** Emisión desde los subcomponentes */
    onConfigChangeFromChild(config: Record<string, any>) {
        this.configJson.set(JSON.stringify(config, null, 2));
        this.configValid.set(true);
        this.configChange.emit(config);
    }

    /** Edición directa del JSON avanzado */
    onConfigChange(value: string) {
        this.configJson.set(value);
        try {
            const parsed = JSON.parse(value);
            this.configValid.set(true);
            this.configChange.emit(parsed);
        } catch {
            this.configValid.set(false);
        }
    }

    getNodeLabel(type: WorkflowNodeType): string {
        return sharedGetNodeLabel(type);
    }

    getNodeColor(type: WorkflowNodeType): string {
        return sharedGetNodeColor(type);
    }

    onFieldDragStart(event: DragEvent, fieldKey: string) {
        if (event.dataTransfer && fieldKey) {
            event.dataTransfer.setData('text/plain', `{{ '{' + '{ ' + fieldKey + ' }' + '}' }}`);
            event.dataTransfer.effectAllowed = 'copy';
        }
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    // --- Tree Generation Helpers ---
    private buildTree(obj: any, parentKey: string, ancestorId: string): TreeNode[] {
        if (obj === null || obj === undefined) return [];
        const nodes: TreeNode[] = [];

        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                const item = obj[0];
                const type = this.getTypeInfo(item);
                const currentPath = parentKey ? parentKey + '.0' : '0';
                const fullPath = `nodes.${ancestorId}.data.${currentPath}`;

                if (type === 'OBJECT' || type === 'ARRAY') {
                    nodes.push({
                        label: '0 (Primer elemento)', key: currentPath, data: { path: fullPath, type: type },
                        leaf: false, expanded: true, children: this.buildTree(item, currentPath, ancestorId), icon: 'pi pi-fw pi-box'
                    });
                } else {
                    nodes.push({
                        label: '0', key: currentPath, data: { path: fullPath, type: type },
                        leaf: true, icon: this.getIconForType(type)
                    });
                }
            }
        } else if (typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                const type = this.getTypeInfo(value);
                const currentPath = parentKey ? parentKey + '.' + key : key;
                const fullPath = `nodes.${ancestorId}.data.${currentPath}`;

                if (type === 'OBJECT' || type === 'ARRAY') {
                    nodes.push({
                        label: key, key: currentPath, data: { path: fullPath, type: type },
                        leaf: false, expanded: true, children: this.buildTree(value, currentPath, ancestorId),
                        icon: type === 'ARRAY' ? 'pi pi-fw pi-list' : 'pi pi-fw pi-box'
                    });
                } else {
                    nodes.push({
                        label: key, key: currentPath, data: { path: fullPath, type: type },
                        leaf: true, icon: this.getIconForType(type)
                    });
                }
            }
        }
        return nodes;
    }

    getTypeInfo(value: any): string {
        if (value === null) return 'NULL';
        if (Array.isArray(value)) return 'ARRAY';
        if (typeof value === 'object') return 'OBJECT';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') return 'NUMBER';
        return 'STRING';
    }

    getIconForType(type: string): string {
        switch (type) {
            case 'STRING': return 'pi pi-fw pi-language';
            case 'NUMBER': return 'pi pi-fw pi-hashtag';
            case 'BOOLEAN': return 'pi pi-fw pi-check-circle';
            default: return 'pi pi-fw pi-circle-fill';
        }
    }

    getTypeBadgeStyle(type: string): any {
        switch (type) {
            case 'STRING': return { backgroundColor: '#166534', color: '#bbf7d0' };
            case 'NUMBER': return { backgroundColor: '#1e3a8a', color: '#bfdbfe' };
            case 'BOOLEAN': return { backgroundColor: '#701a75', color: '#fbcfe8' };
            case 'ARRAY': return { backgroundColor: '#9a3412', color: '#fed7aa' };
            case 'OBJECT': return { backgroundColor: '#374151', color: '#e5e7eb' };
            default: return { backgroundColor: '#475569', color: '#f1f5f9' };
        }
    }
}
