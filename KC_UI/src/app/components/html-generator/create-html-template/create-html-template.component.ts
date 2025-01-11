import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { HtmlGeneratorService } from '../../../services/html-generator.service';

@Component({
  selector: 'app-create-html-template',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatStepperModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './create-html-template.component.html',
  styleUrls: ['./create-html-template.component.scss']
})
export class CreateHtmlTemplateComponent implements OnInit {
  menuForm: FormGroup; 
  generatedHtml: string; 
  iframeSrc: SafeResourceUrl;
  section1backgroundImg: string;
  bgImgURL: string;
  colBlock: string;
  colBlockHTML: string;

  constructor(private fb: FormBuilder, private htmlGeneratorService: HtmlGeneratorService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void { 
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
  
  onSubmit(): void { 
    this.updateIframeSrc();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Call the service to upload the image
      this.htmlGeneratorService.uploadBGImage(file).subscribe(
        response => {
          console.log('Upload successful:', response);
          const imageUrl = response.url; // Assume the server returns the URL of the uploaded image
          this.bgImgURL = response.url;
          this.setBackground(imageUrl);
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

  section1Col(event: MatButtonToggleChange): void { 
    this.colBlock = 'features-list block-1-' + event.value; 
      if(event.value == 1){
        this.colBlockHTML = `
          <div class="bgrid feature">	
              <div class="service-content">	
                <h3 style="color:white;">Column 1</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              </div> 	         	 
          </div>`;
      }else if(event.value == 2){
        this.colBlockHTML = `
          <div class="bgrid feature">	
              <div class="service-content">	
                <h3 style="color:white;">Column 1</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              </div> 	         	 
          </div>        
          <div class="bgrid feature">	
              <div class="service-content">	
                  <h3 style="color:white;">Column 2</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              </div>	                          
          </div>`;
      }else if (event.value == 3){
        this.colBlockHTML = `
          <div class="bgrid feature">	
              <div class="service-content">	
                <h3 style="color:white;">Column 1</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              </div> 	         	 
          </div>        
          <div class="bgrid feature">	
              <div class="service-content">	
                  <h3 style="color:white;">Column 2</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
              </div>	                          
          </div>        
          <div class="bgrid feature">
              <div class="service-content">
                  <h3 style="color:white;">Column 2</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p> 
              </div> 	            	               
          </div>`;
      }
      this.updateIframeSrc();
  }

  generateHtml(menuItems: { name: string, href: string }[]): string {
    const htmlHeader = `
    <!DOCTYPE html>
    <!--[if lt IE 9 ]><html class="no-js oldie" lang="en"> <![endif]-->
    <!--[if IE 9 ]><html class="no-js oldie ie9" lang="en"> <![endif]-->
    <!--[if (gte IE 9)|!(IE)]><!-->
    <html class="no-js" lang="en">
    <!--<![endif]-->
    <head>
        <!--- basic page needs
      ================================================== -->
        <meta charset="utf-8">
        <title>kickConnect-HTML-TEMPLATE-1</title>
        <meta name="description" content="">
        <meta name="author" content="">
        <!-- mobile specific metas
      ================================================== -->
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <!-- Base URL --> 
        <base href="http://localhost:4200/HTML-TEMPLATE-1/">
        <!-- CSS
      ================================================== -->
        <link rel="stylesheet" href="/public/htmlgencode/css/base.css">
        <link rel="stylesheet" href="/public/htmlgencode/css/vendor.css">
        <link rel="stylesheet" href="/public/htmlgencode/css/main.css">
        <!-- Load jQuery from CDN --> 
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
       
        <!-- script
      ================================================== -->
        <script src="/public/htmlgencode/js/modernizr.js"></script>
        <script src="/public/htmlgencode/js/pace.min.js"></script>
        <!-- favicons
      ================================================== -->
        <link rel="shortcut icon" href="/public/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/public/favicon.ico" type="image/x-icon">
    </head>
    <body>`;
    const htmlStartHeader = ` 
      <header id="header" class="row">
        <div class="header-logo">
          <a href="index.html"><img src="assets/img/kickConnect_logo2_white_50.png"></a>
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
