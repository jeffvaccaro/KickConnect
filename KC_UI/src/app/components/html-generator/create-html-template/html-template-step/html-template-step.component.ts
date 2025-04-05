import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { HtmlGeneratorService } from '../../../../services/html-generator.service';
import { generateHtml } from '../html-helpers/helper-generate-html';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { section1Columns } from '../html-helpers/helper-section1-columns/helper-section1-columns';
import { HtmlGeneratedTypes } from '../../../../enums/html-generated-types';

@Component({
  selector: 'app-html-template-step',
  standalone: true,
  imports: [MatStepperModule,MatButtonToggleModule,MatSlideToggleModule,MatFormFieldModule,MatCardModule,MatTabsModule,
    FormsModule,ReactiveFormsModule
  ],
  templateUrl: './html-template-step.component.html'
})
export class HtmlTemplateStepComponent implements OnInit {
  @Input() sectionTitle: string;
  @Input() columns: number;
   
  constructor(private fb: FormBuilder, private htmlGeneratorService: HtmlGeneratorService, private sanitizer: DomSanitizer) {}
    
  ngOnInit(): void { 
    console.log('Child component initialized');
    console.log('Section title:', this.sectionTitle);
    console.log('Columns:', this.columns);
  }    
}
