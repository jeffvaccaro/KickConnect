import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    //this.updateIframeSrc();
  } 
  
  removeMenuItem(index: number): void { 
    this.menuItems.removeAt(index); 
  } 
  
  addToHTML(): void {
    this.updateIframeSrc();
  }

  // onSubmit(): void { 
  //   this.updateIframeSrc();
  // }

  onImageUpload(event: Event, section: number, type: string, colNum: number = 0): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Call the service to upload the image
      this.htmlGeneratorService.uploadBGImage(file).subscribe(
        response => {
          const imageUrl = response.url;
          switch(type){
            case "background":
              this.bgImgURL = response.url;
              this.setBackground(imageUrl);
              break;
            case "columns":
              this.colImgURL = response.url;
              break;
          }
        },
        error => {
          console.error('Error uploading image:', error);
          // Handle the error, e.g., show an error message
        }
      );
    }
  }

  setBackground(imageUrl: string): void {
    this.section1backgroundImg = `
      <style>
        .${this.colBlock.replace(/ /g, ".")} {
        width: 100vw;
        margin: 0;
        padding: 0;
        background-image: url('${imageUrl}');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        }
      </style>`;
    this.updateIframeSrc();
  }

  updateColBlockHTML():void {
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

  onCol3TabChanged(event: number){
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

  generateContentForColumn(type: string, header: string, text: string, content: string = ''): string {
    if (type === 'text') {
      return `
        <div class="service-content">
          <h3 style="color:${this.columnColor};">${header}</h3>
          <p style="color:${this.columnColor};">${text}</p>
        </div>
      `;
    } else if (type === 'image') {
      return `
        <div class="service-content">
          <img src="${content}" alt="Description" style="max-width: 100%;">
        </div>
      `;
    } else if (type === 'video') {
      return `
        <div class="service-content">
          <video controls style="max-width: 100%;">
            <source src="${content}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    }
    return '';
  }
  

  section1Columns(event: MatButtonToggleChange): void { 
    this.columnCount = event.value;

    this.colBlock = 'features-list block-1-' + event.value; 
      if(event.value == 1){
        this.colBlockHTML = `
        <div class="bgrid feature" style="width:85%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">  
          <div class="service-content">  
            <h3 style="color:${this.columnColor};">${this.col1HeaderText}</h3>
              <p style="color:${this.columnColor};">${this.col1TextBlock}</p>
          </div>                   
        </div>`;
      
        this.col1 = true;
        this.col2 = false;
        this.col3 = false;
      }else if(event.value == 2){
        this.colBlockHTML = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
          <div class="bgrid feature block-1-2" style="flex: 1; max-width: 45%; margin: 0 10px;">  
            <div class="service-content">  
              <h3 style="color:${this.columnColor};">${this.col1HeaderText}</h3>
              <p style="color:${this.columnColor};">${this.col1TextBlock}</p>
            </div>                   
          </div>        
          <div class="bgrid feature block-1-2" style="flex: 1; max-width: 45%; margin: 0 10px;">  
            <div class="service-content">  
              <h3 style="color:${this.columnColor};">${this.col2HeaderText}</h3>
              <p style="color:${this.columnColor};">${this.col2TextBlock}</p>
            </div>                   
          </div>
        </div>`;
      
          this.col1 = true;
          this.col2 = true;
          this.col3 = false;
      }else if (event.value == 3){
        this.colBlockHTML = `
          <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
            <div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px;">  
              <div class="service-content">  
                <h3 style="color:${this.columnColor};">${this.col1HeaderText}</h3>
                <p style="color:${this.columnColor};">${this.col1TextBlock}</p>
              </div>                   
            </div>        
            <div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px;">  
              <div class="service-content">  
                <h3 style="color:${this.columnColor};">${this.col2HeaderText}</h3>
                <p style="color:${this.columnColor};">${this.col2TextBlock}</p>
              </div>                   
            </div>
            <div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px;">  
              <div class="service-content">  
                <h3 style="color:${this.columnColor};">${this.col3HeaderText}</h3>
                <p style="color:${this.columnColor};">${this.col3TextBlock}</p>
              </div>                   
            </div>
          </div>`;

          this.col1 = true;
          this.col2 = true;
          this.col3 = true;
      }
      this.updateIframeSrc();
  }

  generateHtml(menuItems: { name: string, href: string }[]): string {
    const htmlHeader = `
    <!DOCTYPE html>
    <html class="no-js" lang="en">
    <head>
      <meta charset="utf-8">
      <title>kickConnect-HTML-TEMPLATE-1</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <base href="http://localhost:4200/HTML-TEMPLATE-1/">
      <link rel="stylesheet" href="/public/htmlgencode/css/base.css">
      <link rel="stylesheet" href="/public/htmlgencode/css/vendor.css">
      <link rel="stylesheet" href="/public/htmlgencode/css/main.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
      <script src="/public/htmlgencode/js/modernizr.js"></script>
      <script src="/public/htmlgencode/js/pace.min.js"></script>
      <link rel="shortcut icon" href="/public/favicon.ico" type="image/x-icon">
      <link rel="icon" href="/public/favicon.ico" type="image/x-icon">
    </head>
   
    <body>`;
    const htmlStartHeader = ` 
      <header id="header" class="row">
        <div class="header-logo">
          <a href="index.html"><img src="../../../../assets/img/kickConnect_logo2_white_50.png"></a>
        </div>
        <nav id="header-nav-wrap">
          <ul class="header-main-nav">`;

    const htmlMenuItems = menuItems.map(item => `
            <li><a class="smoothscroll" href="${item.href}" title="${item.name}">${item.name}</a></li>`).join('\n');

    const htmlEndHeader = ` 
          </ul>
          <!--a href="#" title="sign-up" class="button button-primary cta">Sign Up</a-->
        </nav>
        <a class="header-menu-toggle" href="#"><span>Menu</span></a>
      </header> <br/><br/>`;
    
    const bgS1Img = this.section1backgroundImg;

    const section1a = `<br/><br/>
      <section id="section1" style="background-image: url('${this.bgImgURL}'); background-size: cover; background-repeat: no-repeat; background-position: center;">
        <div class="row about-features">
            <div class="${this.colBlock}">
              ${this.colBlockHTML}
            </div>
        </div>
      </section>`;

    const section1b = `
      <section id="about">
        <div class="row about-intro">SECTION 1b:
          <div class="col-four">
            <h1>About Our App</h1>
          </div>
          <div class="col-eight">
            <p>Excepteur enim magna veniam labore veniam sint. Ex aliqua esse proident ullamco voluptate. Nisi nisi nisi aliqua eiusmod dolor dolor proident deserunt occaecat elit Lorem reprehenderit. Id culpa veniam ex aliqua magna elit pariatur do nulla. Excepteur enim magna veniam labore veniam sint.</p>
          </div>  
        </div>
      </section>
    `;
    const footer = `      
      <!--script src="js/main.js"></script-->
    </body>
    </html>`;

    return htmlHeader + htmlStartHeader + htmlMenuItems + htmlEndHeader +  section1a + section1b + footer;
  }

  updateIframeSrc(): void { 
    const menuItems = this.menuForm.value.menuItems; 
    this.generatedHtml = this.generateHtml(menuItems); 

    if (this.generatedHtml) {
      const blob = new Blob([this.generatedHtml], { type: 'text/html' });
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
    }
  }
}
