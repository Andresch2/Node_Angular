import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TreeModule } from 'primeng/tree';

@Component({
    selector: 'app-json-schema-builder',
    standalone: true,
    imports: [CommonModule, FormsModule, TextareaModule, ButtonModule, TreeModule],
    template: `
        <div class="schema-builder-container">
            <label style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #e2e8f0;">
                <i class="pi pi-code" style="margin-right: 0.3rem;"></i> Payload de Muestra (JSON)
            </label>
            <textarea pTextarea [(ngModel)]="sampleJson" rows="6" class="w-full"
                placeholder='{ "success": true, "data": { "id": 1 } }'
                style="background: #0f172a; border: 1px solid #334155; color: #e2e8f0; font-family: monospace;"></textarea>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <small style="color: #64748b; font-size: 0.75rem;">
                    Pega un JSON de ejemplo para generar el árbol de variables.
                </small>
                <p-button label="Generar Árbol" icon="pi pi-sitemap" size="small" (onClick)="generateTree()" severity="secondary" />
            </div>

            @if (treeNodes().length > 0) {
            <div style="margin-top: 1.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #e2e8f0;">
                    <i class="pi pi-check-square" style="margin-right: 0.3rem;"></i> Selecciona las variables a exponer
                </label>
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 0.5rem; max-height: 300px; overflow-y: auto;">
                    <p-tree [value]="treeNodes()" selectionMode="checkbox" [(selection)]="selectedNodes" (onNodeSelect)="onSelectionChange()" (onNodeUnselect)="onSelectionChange()"
                            [style]="{'background': 'transparent', 'border': 'none', 'color': '#e2e8f0', 'padding': '0'}">
                        <ng-template let-node pTemplate="default">
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-family: monospace; color: #e2e8f0;">{{ node.label }}</span>
                                <span [ngStyle]="getTypeBadgeStyle(node.data.type)" style="font-size: 0.65rem; padding: 0.1rem 0.3rem; border-radius: 4px; font-weight: 600;">
                                    {{ node.data.type }}
                                </span>
                            </span>
                        </ng-template>
                    </p-tree>
                </div>
                <small style="color: #64748b; font-size: 0.75rem; display: block; margin-top: 0.4rem;">
                    Las variables seleccionadas aparecerán en la parte inferior de la pantalla para arrastrarlas a otros nodos.
                </small>
            </div>
            }
        </div>
    `
})
export class JsonSchemaBuilderComponent implements OnChanges {
    @Input() expectedVariables: string[] = [];
    @Output() expectedVariablesChange = new EventEmitter<string[]>();

    private messageService = inject(MessageService);

    sampleJson = signal('');
    treeNodes = signal<TreeNode[]>([]);
    selectedNodes: TreeNode[] | TreeNode = [];

    ngOnChanges(changes: SimpleChanges) {
        // Initialization can go here if we want to reverse-engineer a tree from just `expectedVariables` string array.
        // But usually, the tree needs the original JSON to rebuild. We will keep it simple: 
        // If they already have expected variables, we can just leave them in memory. The user would need to paste the JSON again to see the tree.
        // A full implementation would save the `sampleJson` inside the node configuration. For now we will focus on generating the variables.
    }

    generateTree() {
        if (!this.sampleJson().trim()) {
            this.treeNodes.set([]);
            return;
        }

        try {
            const parsed = JSON.parse(this.sampleJson());
            const nodes = this.buildTree(parsed, '');
            this.treeNodes.set(nodes);

            // Auto-select based on existing expectedVariables if they match keys
            this.selectedNodes = this.findNodesByKeys(nodes, this.expectedVariables);
            this.onSelectionChange();

        } catch (e) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON format' });
        }
    }

    private buildTree(obj: any, parentKey: string): TreeNode[] {
        if (obj === null || obj === undefined) return [];

        const nodes: TreeNode[] = [];

        if (Array.isArray(obj)) {
            // For arrays, we just show the first item as a template if it exists
            if (obj.length > 0) {
                const item = obj[0];
                const type = this.getTypeInfo(item);
                const currentPath = parentKey ? parentKey + '.0' : '0';

                if (type === 'OBJECT' || type === 'ARRAY') {
                    const children = this.buildTree(item, currentPath);
                    // Instead of showing "0", we can just attach the children directly to the array node
                    // But to keep exact paths like items.0.name, we show it
                    nodes.push({
                        label: '0 (Primer elemento)',
                        key: currentPath,
                        data: { path: currentPath, type: type },
                        leaf: false,
                        expanded: true,
                        children: children,
                        icon: 'pi pi-fw pi-box'
                    });
                } else {
                    nodes.push({
                        label: '0',
                        key: currentPath,
                        data: { path: currentPath, type: type },
                        leaf: true,
                        icon: this.getIconForType(type)
                    });
                }
            }
        } else if (typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                const type = this.getTypeInfo(value);
                const currentPath = parentKey ? parentKey + '.' + key : key;

                if (type === 'OBJECT' || type === 'ARRAY') {
                    nodes.push({
                        label: key,
                        key: currentPath,
                        data: { path: currentPath, type: type },
                        leaf: false,
                        expanded: true,
                        children: this.buildTree(value, currentPath),
                        icon: type === 'ARRAY' ? 'pi pi-fw pi-list' : 'pi pi-fw pi-box'
                    });
                } else {
                    nodes.push({
                        label: key,
                        key: currentPath,
                        data: { path: currentPath, type: type },
                        leaf: true,
                        icon: this.getIconForType(type)
                    });
                }
            }
        }

        return nodes;
    }

    private getTypeInfo(value: any): string {
        if (value === null) return 'NULL';
        if (Array.isArray(value)) return 'ARRAY';
        if (typeof value === 'object') return 'OBJECT';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') return 'NUMBER';
        return 'STRING';
    }

    private getIconForType(type: string): string {
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

    private findNodesByKeys(nodes: TreeNode[], keys: string[]): TreeNode[] {
        let found: TreeNode[] = [];
        for (const node of nodes) {
            if (node.key && keys.includes(node.key)) {
                found.push(node);
            }
            if (node.children) {
                found = found.concat(this.findNodesByKeys(node.children, keys));
            }
        }
        return found;
    }

    onSelectionChange() {
        const selections = Array.isArray(this.selectedNodes) ? this.selectedNodes : [this.selectedNodes];

        // Extraer todos los paths válidos
        const selectedPaths = selections
            .filter(node => node && node.data && node.data.path)
            .map(node => node.data.path);

        this.expectedVariablesChange.emit(selectedPaths);
    }
}
