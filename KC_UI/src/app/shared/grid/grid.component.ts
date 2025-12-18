import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'visibleCols', pure: false })
export class VisibleColsPipe implements PipeTransform {
  transform(columns: any[]): any[] {
    // Attach original index for drag/drop
    return columns
      .map((col, i) => ({ ...col, _index: i }))
      .filter(col => col.visible !== false);
  }
}



import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDropList, CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

export interface GridColumn {
  field: string;
  header: string;
  customHeader?: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
}

@Component({
  selector: 'app-shared-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {
  visibleColumns: GridColumn[] = [];
  get filteredData(): any[] {
    if (!this.filters || Object.keys(this.filters).length === 0) return this.data;
    return this.data.filter(row => {
      return Object.entries(this.filters).every(([field, value]) => {
        if (!value) return true;
        const cell = row[field];
        return cell !== undefined && cell !== null && cell.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    });
  }
  private _columns: GridColumn[] = [];
  @Input() set columns(cols: GridColumn[]) {
    this._columns = cols;
    this.updateVisibleColumns();
  }
  get columns(): GridColumn[] {
    return this._columns;
  }
  @Input() data: any[] = [];

  @ViewChild('chooserBtn', { static: false }) chooserBtn!: ElementRef;
  @ViewChild('gridCard', { static: false }) gridCard!: ElementRef;

  dropdownPosition: { [key: string]: string } = {};

  @Output() columnsChange = new EventEmitter<GridColumn[]>();
  @Output() sortChange = new EventEmitter<{field: string, direction: 'asc' | 'desc'}>();
  @Output() filterChange = new EventEmitter<{field: string, value: any}>();

  sortState: { field: string, direction: 'asc' | 'desc' } | null = null;
  filters: { [key: string]: any } = {};
  filterBoxOpen: { [key: string]: boolean } = {};
  dragOverIndex: number | null = null;
  columnChooserOpen = false;
  editingHeaderIndex: number | null = null;
  headerEditValue: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  toggleFilterBox(col: GridColumn, event: Event) {
    event.stopPropagation();
    this.filterBoxOpen[col.field] = !this.filterBoxOpen[col.field];
  }

  onDrop(event: CdkDragDrop<string[]>) {
    const fromVisibleIdx = event.previousIndex;
    const toVisibleIdx = event.currentIndex;
    const fromCol = this.visibleColumns[fromVisibleIdx];
    if (!fromCol) return;
    const fromIdx = this.columns.findIndex(c => c.field === fromCol.field);
    const [moved] = this.columns.splice(fromIdx, 1);
    const visibleAfterRemoval = this.columns.filter(col => col.visible !== false);
    let insertIdx;
    if (toVisibleIdx >= visibleAfterRemoval.length) {
      insertIdx = this.columns.length;
    } else {
      const toCol = visibleAfterRemoval[toVisibleIdx];
      insertIdx = this.columns.findIndex(c => c.field === toCol.field);
    }
    this.columns.splice(insertIdx, 0, moved);
    this.updateVisibleColumns();
    this.columnsChange.emit(this.columns);
    this.dragOverIndex = null;
  }

  onSort(col: GridColumn) {
    if (!col.sortable) return;
    if (this.sortState && this.sortState.field === col.field) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState = { field: col.field, direction: 'asc' };
    }
    this.sortChange.emit(this.sortState);
  }

  toggleColumn(col: GridColumn, event: Event) {
    event.stopPropagation();
    col.visible = !col.visible;
    this.updateVisibleColumns();
    this.columnsChange.emit(this.columns);
  }

  setColumnVisibility(col: GridColumn, visible: boolean) {
    col.visible = visible;
    this.updateVisibleColumns();
    this.columnsChange.emit(this.columns);
  }
  updateVisibleColumns() {
    this.visibleColumns = this.columns.filter(col => col.visible !== false);
  }

  onFilter(col: GridColumn, value: string) {
    this.filters[col.field] = value;
    this.filterChange.emit({ field: col.field, value });
  }

  onDragEntered(index: number) {
    this.dragOverIndex = index;
    this.cdr.detectChanges();
  }

  onDragExited() {
    this.dragOverIndex = null;
    this.cdr.detectChanges();
  }

  toggleColumnChooser(event: Event) {
    event.stopPropagation();
    this.columnChooserOpen = !this.columnChooserOpen;
    if (this.columnChooserOpen) {
      setTimeout(() => this.positionDropdown(), 0);
    }
  }

  startEditHeader(index: number) {
    this.editingHeaderIndex = index;
    this.headerEditValue = this.visibleColumns[index].customHeader || this.visibleColumns[index].header;
    setTimeout(() => {
      const input = document.getElementById('header-edit-input-' + index) as HTMLInputElement;
      if (input) input.focus();
    }, 0);
  }

  saveEditHeader(index: number) {
    const col = this.visibleColumns[index];
    col.customHeader = this.headerEditValue.trim() || col.header;
    this.persistCustomHeaders();
    this.editingHeaderIndex = null;
    this.headerEditValue = '';
  }

  cancelEditHeader() {
    this.editingHeaderIndex = null;
    this.headerEditValue = '';
  }

  persistCustomHeaders() {
    const customHeaders: { [field: string]: string } = {};
    this.columns.forEach(col => {
      if (col.customHeader && col.customHeader !== col.header) {
        customHeaders[col.field] = col.customHeader;
      }
    });
    localStorage.setItem('gridCustomHeaders', JSON.stringify(customHeaders));
  }

  loadCustomHeaders() {
    const raw = localStorage.getItem('gridCustomHeaders');
    if (!raw) return;
    try {
      const customHeaders = JSON.parse(raw);
      this.columns.forEach(col => {
        if (customHeaders[col.field]) {
          col.customHeader = customHeaders[col.field];
        }
      });
      this.updateVisibleColumns();
    } catch {}
  }

  ngOnInit() {
    this.updateVisibleColumns();
    this.loadCustomHeaders();
    window.addEventListener('click', this._closeChooserOnOutsideClick);
  }
  ngOnDestroy() {
    window.removeEventListener('click', this._closeChooserOnOutsideClick);
  }
  private _closeChooserOnOutsideClick = (event: MouseEvent) => {
    if (this.columnChooserOpen) {
      this.columnChooserOpen = false;
    }
  };

    getCheckboxChecked(event: Event): boolean {
    const target = event.target as HTMLInputElement | null;

    return target ? target.checked : false;
  }

  isAnyFilterOpen(): boolean {
    return Object.values(this.filterBoxOpen).some(open => open);
  }

  ngAfterViewInit() {
    if (this.columnChooserOpen) {
      this.positionDropdown();
    }
  }

  positionDropdown() {
    if (!this.chooserBtn || !this.gridCard) {
      // Fallback: set a default position
      this.dropdownPosition = {
        position: 'fixed',
        top: '80px',
        left: '32px',
        zIndex: '3000',
        minWidth: '220px',
      };
      return;
    }
    const btnRect = this.chooserBtn.nativeElement.getBoundingClientRect();
    const cardRect = this.gridCard.nativeElement.getBoundingClientRect();
    // Position the dropdown below and right-aligned to the button, relative to viewport
    this.dropdownPosition = {
      position: 'fixed',
      top: `${btnRect.bottom + 4}px`,
      left: `${btnRect.right - 240}px`, // 240px is approx dropdown width
      zIndex: '3000',
      minWidth: '220px',
    };
  }

  closeColumnChooser() {
    this.columnChooserOpen = false;
  }

  onDragStarted(index: number) {
    // No-op for now, but required for template
  }

  onDragEnded() {
    // No-op for now, but required for template
  }
}
