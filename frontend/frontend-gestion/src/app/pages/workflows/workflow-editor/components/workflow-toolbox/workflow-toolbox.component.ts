import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { WorkflowNodeType } from '../../../../../core/models/workflow.model';

export interface ToolboxItem {
    type: WorkflowNodeType;
    label: string;
    description: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-workflow-toolbox',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './workflow-toolbox.component.html',
    styleUrls: []
})
export class WorkflowToolboxComponent {
    @Output() dragStart = new EventEmitter<{ event: DragEvent, item: ToolboxItem }>();

    toolboxItems: ToolboxItem[] = [
        { type: WorkflowNodeType.TRIGGER, label: 'Trigger', description: 'Punto de entrada', icon: 'pi-bolt', color: '#6366f1' },
        { type: WorkflowNodeType.HTTP, label: 'HTTP', description: 'Llamada API', icon: 'pi-globe', color: '#22c55e' },
        { type: WorkflowNodeType.WEBHOOK, label: 'Webhook', description: 'Enviar datos', icon: 'pi-link', color: '#f59e0b' },
        { type: WorkflowNodeType.ACTION, label: 'Action', description: 'Ejecutar lógica', icon: 'pi-cog', color: '#3b82f6' },
        { type: WorkflowNodeType.NOTIFICATION, label: 'Notificación', description: 'Enviar mensaje', icon: 'pi-bell', color: '#10b981' },
        { type: WorkflowNodeType.DELAY, label: 'Delay', description: 'Esperar tiempo', icon: 'pi-clock', color: '#ef4444' },
        { type: WorkflowNodeType.FORM, label: 'Formulario', description: 'Pedir información', icon: 'pi-list', color: '#8b5cf6' },
    ];

    onDragStart(event: DragEvent, item: ToolboxItem) {
        if (event.dataTransfer) {
            event.dataTransfer.setData('node-type', item.type);
        }
        this.dragStart.emit({ event, item });
    }
}
