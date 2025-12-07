import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { updateHeaderText } from './html-helpers/helper-section1-columns/helper-section1-columns';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { generateSectionContent } from './html-helpers/helper-generate-html';
import { HtmlGeneratorService } from '../../../services/html-generator.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'html-steppers',
    standalone: true,
    templateUrl: './html-steppers.component.html',
    imports: [MatStepperModule, MatButtonToggleModule, MatSlideToggleModule, MatFormFieldModule, MatCardModule, MatTabsModule, MatInputModule, MatIconModule,
        FormsModule, ReactiveFormsModule, CommonModule],
    styleUrls: ['html-steppers.component.scss']
})
export class HtmlStepperComponent implements OnInit, OnChanges {
  @Input() SectionHeader: string;
  @Input() SectionName: string;
  @Input() textColor: string;
  @Input() columnsCount: number = 1;
  @Input() bgImgURLInput: string;
  @Input() formEmailTo?: string; // Optional email recipient for default form submissions
  @Output() TextToUpdateIFrame = new EventEmitter<{ sectionName: string, html: string }>();

  placeholderText: string = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
  columnColor: string = 'white';
  tabIndex: number = 1;

  columns = [
    { headerText: 'Column 1', textBlock: this.placeholderText, image: '' }
  ]

  generatedHtmlText: string; 
  iframeSrc: SafeResourceUrl;

  bgImgURL: string;
  isDarkText: boolean = false;

  colBlockHTML: string;
  colBlock: string;
  col1: boolean;
  col2: boolean;
  col3: boolean;
  private colImages: string[] = [];
  private updatingColumns: boolean = false; // Flag to prevent redundant updates
  // Form dropdown options (shared for now; could be per-column if needed)
  programOptions: string[] = ['Kickboxing', 'Strength', 'Yoga'];
  locationOptions: string[] = ['Downtown', 'Northside'];
  newProgramOption: string = '';
  newLocationOption: string = '';
  // Inline SVG icon for form buttons
  formSvg: string = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 3h6v4H9z"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>';
  
  constructor(private fb: FormBuilder, private htmlGeneratorService: HtmlGeneratorService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void { 
    // Simplify: focus on section content only
    if (this.textColor) {
      this.columnColor = this.textColor;
    }
    this.updateColumns({ value: this.columnsCount } as MatButtonToggleChange);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textColor'] && changes['textColor'].currentValue) {
      this.columnColor = changes['textColor'].currentValue;
      this.updateColBlockHTML();
    }
    if (changes['columnsCount'] && changes['columnsCount'].currentValue) {
      const val = changes['columnsCount'].currentValue;
      this.updateColumns({ value: val } as MatButtonToggleChange);
    }
    if (changes['bgImgURLInput']) {
      this.bgImgURL = changes['bgImgURLInput'].currentValue;
      this.updateIframeSrc();
    }
  }

  // Removed per-section menu management; parent component builds the menu from sections

  changeColors(bgColor: string, fgColor: string): void {
    //this.updateCombinedHtml(bgColor, fgColor);
  }

  switchTextColor(event: MatSlideToggleChange): void {
    this.isDarkText = event.checked;
    // If parent provided a text color, prefer it unless user explicitly toggles here
    this.columnColor = event.checked ? 'black' : (this.textColor || 'white');
    this.updateColBlockHTML();
  }

  onColTabChanged(event: number): void {
    this.tabIndex = event;
  }

  async addColumn(): Promise<void> {
    const newIndex = this.columns.length + 1;
    this.columns.push({
      headerText: `Column ${newIndex}`,
      textBlock: this.placeholderText,
      image: ''
    });
  }

  async removeColumn(): Promise<void> {
    if (this.columns.length > 1) {
      this.columns.pop();
    }
  }

  getDifference(colsChangedValue: number, colsCurrentValue: number): number {
    return colsChangedValue - colsCurrentValue;
  }

  async updateColumns(event: MatButtonToggleChange): Promise<void> {
    if (this.updatingColumns) return; // Prevent redundant updates
    this.updatingColumns = true;
    
    const difference = this.getDifference(Number(event.value), this.columns.length);
    const isNewValueGT = difference > 0;

    if (isNewValueGT) {
      console.log('Adding columns...');
      for (let i = 0; i < difference; i++) {
        await this.addColumn();
      }
    } else {
      console.log('Removing columns...');
      for (let i = 0; i < Math.abs(difference); i++) {
        await this.removeColumn();
      }
    }

    const result = await updateHeaderText(event, this.columnColor, this.columns);

    this.colBlockHTML = result.colBlockHTML;
    this.col1 = result.col1;
    this.col2 = result.col2;
    this.col3 = result.col3;
    this.colBlock = result.colBlock;

    this.updateIframeSrc();

    this.updatingColumns = false; // Reset flag after update
  }

  updateIframeSrc(): void {     
    this.generatedHtmlText = this.generateSectionHtml(); 
    this.TextToUpdateIFrame.emit({ sectionName: this.SectionName, html: this.generatedHtmlText });
  }

  // Generating HTML for each section to send to the parent
  generateSectionHtml(): string { 
    if (!this.colBlockHTML) return '';
    const bgUrl = this.bgImgURL || this.bgImgURLInput;
    // Apply lightweight markdown to user text inside the block, keeping HTML intact
    const htmlWithMarkdown = this.applyMarkdown(this.colBlockHTML);
    return generateSectionContent(this.SectionName, bgUrl, htmlWithMarkdown);
  }

  onImageUpload(event: Event, section: number, type: string, colNum: number = 0): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Call the service to upload the image
      this.htmlGeneratorService.uploadBGImage(file).subscribe(
        response => {
          const imageUrl = response.url;
          const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${environment.apiUrl}${imageUrl}`;
          if (type === "background") {
            this.bgImgURL = fullUrl;
            this.setBackground(this.bgImgURL, this.colBlock);
          } else if (type === "columns" && [2, 3].includes(colNum)) {
            this.updateColBlockImage(colNum, fullUrl);
          }
        },
        error => {
          console.error('Error uploading image:', error);
          // Handle the error, e.g., show an error message
        }
      );
    }
  }

  setBackground(img: string, styleBlock: String): void {
    this.updateIframeSrc();
  }

  updateColBlockImage(colNum: number, imageUrl: string): void {
    this.colImages[colNum] = imageUrl;
    this.updateColBlockHTML();
  }

  updateColBlockHTML(): void {
    if (this.col3) {
      const event = { value: 3 } as MatButtonToggleChange;
      this.updateColumns(event);
    } else if (this.col2) {
      const event = { value: 2 } as MatButtonToggleChange;
      this.updateColumns(event);
    } else {
      const event = { value: 1 } as MatButtonToggleChange;
      this.updateColumns(event);
    }
  }

  addProgramOption(): void {
    const v = (this.newProgramOption || '').trim();
    if (v && !this.programOptions.includes(v)) {
      this.programOptions.push(v);
      this.newProgramOption = '';
    }
  }

  removeProgramOption(index: number): void {
    this.programOptions.splice(index, 1);
  }

  addLocationOption(): void {
    const v = (this.newLocationOption || '').trim();
    if (v && !this.locationOptions.includes(v)) {
      this.locationOptions.push(v);
      this.newLocationOption = '';
    }
  }

  removeLocationOption(index: number): void {
    this.locationOptions.splice(index, 1);
  }

  // Toolbar actions: apply simple markdown markers
  applyFormat(index: number, type: 'bold' | 'italic' | 'bullet'): void {
    const block = this.columns[index].textBlock || '';
    if (type === 'bold') {
      this.columns[index].textBlock = `**${block}**`;
    } else if (type === 'italic') {
      this.columns[index].textBlock = `_${block}_`;
    } else if (type === 'bullet') {
      const lines = block.split(/\r?\n/).filter(l => l.trim().length);
      this.columns[index].textBlock = lines.map(l => `- ${l}`).join('\n');
    }
    this.updateColBlockHTML();
  }

  // Lightweight Markdown parsing supporting bold, italic, and bullet lists without escaping tags
  private applyMarkdown(inputHtmlBlock: string): string {
    // Operate on the block string: convert markdown markers where present
    let s = inputHtmlBlock;
    // Bold: **text** -> <strong>text</strong>
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: _text_ -> <em>text</em>
    s = s.replace(/_(.+?)_/g, '<em>$1</em>');
    // Lists: lines starting with - ... -> wrap consecutive lines in <ul><li>
    const lines = s.split(/\r?\n/);
    let out: string[] = [];
    let inList = false;
    for (const line of lines) {
      const m = line.match(/^\s*-\s+(.*)/);
      if (m) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${m[1]}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');
    return out.join('\n');
  }

  // Insert a default reservation form into the given column
  insertDefaultForm(index: number): void {
    const emailTo = this.formEmailTo || '';
    const programOpts = this.programOptions.map(o => `<option>${o}</option>`).join('');
    const locationOpts = this.locationOptions.map(o => `<option>${o}</option>`).join('');
    const formHtml = `
<form class="kc-reserve-form" data-email-to="${emailTo}" action="" method="post" style="max-width:540px;margin:0 auto;display:block;">
  <style>
    .kc-input, .kc-select { width:100%; box-sizing:border-box; padding:14px 16px; border:1px solid #d0d0d0; border-radius:8px; font-size:16px; line-height:22px; }
    .kc-select { appearance:none; -webkit-appearance:none; -moz-appearance:none; background-color:#fff; }
    .kc-row { display:flex; gap:12px; width:100%; }
    .kc-col { flex:1; min-width:0; }
  </style>
  <div class="kc-row">
    <div class="kc-col"><input class="kc-input" name="firstName" type="text" placeholder="First Name" /></div>
    <div class="kc-col"><input class="kc-input" name="lastName" type="text" placeholder="Last Name" /></div>
  </div>
  <div style="margin-top:12px;width:100%;">
    <input class="kc-input" name="email" type="email" placeholder="Email" />
  </div>
  <div style="margin-top:12px;width:100%;">
    <input class="kc-input" name="phone" type="tel" placeholder="Phone" />
  </div>
  <div style="margin-top:12px;width:100%;">
    <select class="kc-select" name="program">
      <option selected disabled>Select Program</option>
      ${programOpts}
    </select>
  </div>
  <div style="margin-top:12px;width:100%;">
    <select class="kc-select" name="location">
      <option selected disabled>Location</option>
      ${locationOpts}
    </select>
  </div>
  <div style="margin-top:18px;width:100%;display:flex;justify-content:center;">
    <button type="submit" style="background:#ff3b30;color:#fff;border:none;border-radius:24px;padding:12px 22px;font-weight:600;">SUBMIT</button>
  </div>
</form>`;
    this.columns[index].textBlock = formHtml;
    this.updateColBlockHTML();
  }

  // Clear the column content (used to remove the form)
  clearColumn(index: number): void {
    this.columns[index].textBlock = '';
    this.updateColBlockHTML();
  }
}
