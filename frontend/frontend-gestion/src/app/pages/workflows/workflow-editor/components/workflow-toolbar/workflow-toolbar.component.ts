import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Workflow } from '../../../../../core/models/workflow.model';

@Component({
    selector: 'app-workflow-toolbar',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, TooltipModule],
    templateUrl: './workflow-toolbar.component.html',
    styleUrls: []
})
export class WorkflowToolbarComponent {
    @Input() workflow: Workflow | null | undefined;
    @Input() connecting = false;
    @Input() simulating = false;
    @Input() executing = false;
    @Input() saving = false;

    @Output() goBack = new EventEmitter<void>();
    @Output() cancelConnection = new EventEmitter<void>();
    @Output() startSimulation = new EventEmitter<void>();
    @Output() stopSimulation = new EventEmitter<void>();
    @Output() realExecute = new EventEmitter<void>();
    @Output() saveAll = new EventEmitter<void>();
}
