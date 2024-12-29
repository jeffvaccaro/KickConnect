import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
@Component({
  selector: 'app-create-html-template',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatStepperModule],
  templateUrl: './create-html-template.component.html',
  styleUrls: ['./create-html-template.component.scss']
})
export class CreateHtmlTemplateComponent implements OnInit {
  menuForm: FormGroup; 
  generatedHtml: string; 
  iframeSrc: SafeResourceUrl;

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {}

  ngOnInit(): void { 
    this.menuForm = this.fb.group({ menuItems: this.fb.array([]) });
    this.addMenuItem(); // Add a default item for illustration
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
    const menuItems = this.menuForm.value.menuItems; 
    this.generatedHtml = this.generateHtml(menuItems); 
    this.updateIframeSrc();
  }

  generateHtml(menuItems: { name: string, href: string }[]): string {
    const html = `
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
        <link rel="stylesheet" href="css/base.css">
        <link rel="stylesheet" href="css/vendor.css">
        <link rel="stylesheet" href="css/main.css">

        <!-- Load jQuery from CDN --> 
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
       
        <!-- script
      ================================================== -->
        <script src="js/modernizr.js"></script>
        <script src="js/pace.min.js"></script>

        <!-- favicons
      ================================================== -->
        <link rel="shortcut icon" href="/public/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/public/favicon.ico" type="image/x-icon">

    </head>
    <body>
      <header id="header" class="row">
        <div class="header-logo">
          <a href="index.html"><img src="/public/img/kickConnect_logo2_white_50.png"></a>
        </div>
        <nav id="header-nav-wrap">
          <ul class="header-main-nav">`;

    const header = menuItems.map(item => `
            <li><a class="smoothscroll" href="${item.href}" title="${item.name}">${item.name}</a></li>`).join('\n');

    const footer = `
          </ul>
          <a href="#" title="sign-up" class="button button-primary cta">Sign Up</a>
        </nav>
        <a class="header-menu-toggle" href="#"><span>Menu</span></a>
      </header>
      <script src="js/main.js"></script>
    </body>
    </html>`;

    return html + header + footer;
  }

  updateIframeSrc(): void { 
    if (this.generatedHtml) {
      const blob = new Blob([this.generatedHtml], { type: 'text/html' });
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
    }
  }
}
