import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { HtmlGeneratorService } from '../../../services/html-generator.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { HtmlGeneratedTypes } from '../../../enums/html-generated-types';
import { section1Columns } from './html-helpers/helper-section1-columns/helper-section1-columns';
import { generateHtml } from './html-helpers/helper-generate-html';


@Component({
  selector: 'app-create-html-template',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule, // Corrected import
    MatInputModule, // Added this import
    FormsModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  templateUrl: './create-html-template.component.html',
  styleUrls: ['./create-html-template.component.scss']
})
export class CreateHtmlTemplateComponent implements OnInit {
  menuForm: FormGroup; 
  generatedHtml: string; 
  iframeSrc: SafeResourceUrl;
  section1backgroundImg: string;
  bgImgURL: string;
  colImgURL: string;
  colBlock: string;
  colBlockHTML: string;
  col1: boolean;
  col1HeaderText: string;
  col1TextBlock: string;
  col2: boolean;
  col2HeaderText: string;
  col2TextBlock: string;
  col3: boolean;
  col3HeaderText: string;
  col3TextBlock: string;

  col1Image: string;
  col2Image: string;
  col3Image: string;

  isDarkText: boolean = false;
  columnColor: string;
  currentSection: number = 1;
  columnCount: number = 1;
  column3TabValue: string;
  tabIndex: number = 1;

  constructor(private fb: FormBuilder, private htmlGeneratorService: HtmlGeneratorService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void { 
    this.columnColor = 'white';
    this.col1HeaderText = 'Column 1';
    this.col1TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    this.col2HeaderText = 'Column 2';
    this.col2TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    this.col3HeaderText = 'Column 3';
    this.col3TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    this.currentSection = 1;
    this.columnCount = 1;

    this.menuForm = this.fb.group({ menuItems: this.fb.array([]) });
    this.addMenuItem(); // Add a default item for illustration
    this.updateIframeSrc();
  }

  get menuItems(): FormArray { 
    return this.menuForm.get('menuItems') as FormArray; 
  }

  addMenuItem(): void { 
    this.menuItems.push(this.fb.group({ name: [''], href: [''] })); 
  } 
  
  removeMenuItem(index: number): void { 
    this.menuItems.removeAt(index); 
  } 
  
  addToHTML(): void {
    this.updateIframeSrc();
  }

onImageUpload(event: Event, section: number, type: string, colNum: number = 0): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Call the service to upload the image
    this.htmlGeneratorService.uploadBGImage(file).subscribe(
      response => {
        const imageUrl = response.url;
        switch(type) {
          case "background":
            this.bgImgURL = response.url;
            this.setBackground(this.bgImgURL, this.colBlock);
            break;
          case "columns":
            this.colImgURL = response.url;
            if (colNum === 3) {
              this.col3Image = imageUrl; // Store the image URL for column 3
              this.updateColBlockHTML(); // Call the update function for column 3
            }else if(colNum === 2){
              this.col2Image = imageUrl;
              this.updateColBlockHTML();
            }
            break;
          // Add more cases as needed for different columns or sections
        }
      },
      error => {
        console.error('Error uploading image:', error);
        // Handle the error, e.g., show an error message
      }
    );
  }
}


  //Updates each columns Header/Text
  section1Columns(event: MatButtonToggleChange): void { 
    const result = section1Columns(
      event, 
      this.columnColor, 
      this.col1HeaderText, 
      this.col1TextBlock, 
      this.col2HeaderText, 
      this.col2TextBlock, 
      this.col3HeaderText, 
      this.col3TextBlock,
      this.col2Image,
      this.col3Image
    ); 
    this.colBlockHTML = result.colBlockHTML; 
    this.col1 = result.col1; 
    this.col2 = result.col2; 
    this.col3 = result.col3; 
    this.colBlock = result.colBlock;

    console.log(result.colBlock);
    this.updateIframeSrc(); 
  }

  //Determines how many columns show in the section
  updateColBlockHTML():void {
    console.log('got here');
    if(this.col3){
      const event = { value: 3 } as MatButtonToggleChange
      this.section1Columns(event);
    }else if (this.col2){
      const event = { value:2 } as MatButtonToggleChange
      this.section1Columns(event);
    }else{
      const event = { value: 1 } as MatButtonToggleChange
      this.section1Columns(event);
    }
   
  }
  switchColor(event: MatSlideToggleChange): void{
    this.isDarkText = event.checked;
    if(event.checked == true){
      this.columnColor = 'black';
    }else{
      this.columnColor = 'white';
    }
    this.updateColBlockHTML();
  }

  onColTabChanged(event: number){
    switch(event){
      case 1:
        this.tabIndex = HtmlGeneratedTypes.Text;
        break;
      case 2:
        this.tabIndex = HtmlGeneratedTypes.Image;
        break;
      case 3:
        this.tabIndex = HtmlGeneratedTypes.Video;
        break;
    }    
  }
  
  setBackground(img: string, styleBlock:String):void{
    this.updateIframeSrc();
  }

  generateHtml(menuItems: { 
    name: string, href: string }[]): string { 
      return generateHtml(menuItems, this.bgImgURL, this.colBlock, this.colBlockHTML); 
    }


    updateIframeSrc(): void {     
      this.menuItems.controls.forEach((control: AbstractControl, index: number) => {
        (control as FormGroup).get('href')?.setValue(`#section${index + 1}`);
      });
    
      const menuItems = this.menuForm.value.menuItems;    
      this.generatedHtml = this.generateHtml(menuItems); 
    
      if (this.generatedHtml) {
        const blob = new Blob([this.generatedHtml], { type: 'text/html' });
        this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
      }
    }
    
}
