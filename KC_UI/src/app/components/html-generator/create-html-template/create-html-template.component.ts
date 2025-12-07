import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { HtmlStepperComponent } from './html-steppers.component';
import { HtmlGeneratorService } from '../../../services/html-generator.service';
import { environment } from '../../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-create-html-template',
    standalone: true,
    imports: [
    CommonModule,
    MatCardModule,
    MatStepperModule,
    MatButtonToggleModule,
    MatIconModule,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSlideToggleModule,
    MatTabsModule,
    HtmlStepperComponent,
    HttpClientModule // Include HttpClientModule
],
    templateUrl: './create-html-template.component.html',
    styleUrls: ['./create-html-template.component.scss']
})
export class CreateHtmlTemplateComponent implements OnInit {

  generatedHtml: string = ''; 
  iframeSrc: SafeResourceUrl;
  homeSection = { sectionHeader: 'Home', sectionName: 'home', menuTitle: 'Home', columnsCount: 1 as 1|2|3, bgImgURL: '' };
  sections = [
    { sectionHeader: 'Section 1', sectionName: 'section1', menuTitle: 'Section 1', columnsCount: 1 as 1|2|3, bgImgURL: '' },
    { sectionHeader: 'Section 2', sectionName: 'section2', menuTitle: 'Section 2', columnsCount: 1 as 1|2|3, bgImgURL: '' },
    { sectionHeader: 'Section 3', sectionName: 'section3', menuTitle: 'Section 3', columnsCount: 1 as 1|2|3, bgImgURL: '' },
    { sectionHeader: 'Section 4', sectionName: 'section4', menuTitle: 'Section 4', columnsCount: 1 as 1|2|3, bgImgURL: '' },
    { sectionHeader: 'Section 5', sectionName: 'section5', menuTitle: 'Section 5', columnsCount: 1 as 1|2|3, bgImgURL: '' }
  ];
  sectionHtmls: { [key: string]: string } = {}; // Store HTML for each section

  whiteLogoBase64: string;
  blackLogoBase64: string;
  theme: 'light' | 'dark' | 'gold' | 'blue' | 'red' = 'dark';
  textColorMode: 'auto' | 'light' | 'dark' | 'red' | 'gold' = 'auto';
  columnsCount: 1 | 2 | 3 = 1; // retained for backward-compat but no longer used globally
  bgImgURL: string = '';
  bgFileName: string = '';
  private updateTimer: any;

  constructor(private sanitizer: DomSanitizer, private htmlGeneratorService: HtmlGeneratorService) {}

  ngOnInit(): void { 
    this.loadImages().then(() => {
      // Images are loaded, update the HTML
      this.updateCombinedHtml();
    }).catch(error => {
      console.error('Error loading images:', error);
    });
  }

  loadImages(): Promise<void> {
    return Promise.all([
        lastValueFrom(
            this.htmlGeneratorService.getFileAsBlob('../../../../assets/img/kickConnect_logo2_white_50.png')
                .pipe(
                    switchMap(blob => blob ? this.htmlGeneratorService.convertToBase64(blob) : Promise.reject('Failed to fetch white logo'))
                )
        ).then(base64 => this.whiteLogoBase64 = base64),

        lastValueFrom(
            this.htmlGeneratorService.getFileAsBlob('../../../../assets/img/kickConnect_logo2_black_50.png')
                .pipe(
                    switchMap(blob => blob ? this.htmlGeneratorService.convertToBase64(blob) : Promise.reject('Failed to fetch black logo'))
                )
        ).then(base64 => this.blackLogoBase64 = base64)
    ]).then(() => {}).catch(error => {
        console.error('Error loading one or more images:', error);
    });
  }

  changeColors(bgColor: string, fgColor: string): void {
    // Backward-compatible: set theme from colors if they match known presets
    if (bgColor === '#000') this.theme = 'dark';
    else if (bgColor === '#FFD700') this.theme = 'gold';
    else this.theme = 'light';
    this.scheduleUpdate();
  }

  setTheme(theme: 'light' | 'dark' | 'gold' | 'blue' | 'red'): void {
    this.theme = theme;
    this.scheduleUpdate();
  }

  setTextColor(mode: 'auto' | 'light' | 'dark' | 'red' | 'gold'): void {
    this.textColorMode = mode;
    this.scheduleUpdate();
  }


  // Global columns no longer control sections; per-section will be used
  setColumnsCount(count: 1 | 2 | 3): void { this.columnsCount = count; }

  // Per-section handlers removed


  uploadBackground(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    this.bgFileName = file.name;
    this.htmlGeneratorService.uploadBGImage(file).subscribe(
      (response) => {
        const imageUrl = response.url as string;
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${environment.apiUrl}${imageUrl}`;
        this.bgImgURL = fullUrl;
        // Assign to Home by default since top background maps to Home section now
        this.homeSection.bgImgURL = fullUrl;
        this.scheduleUpdate();
      },
      (error) => {
        console.error('Background upload failed:', error);
      }
    );
  }

  clearBackground(): void {
    this.bgImgURL = '';
    this.bgFileName = '';
    this.scheduleUpdate();
  }

  appendSectionHtml(event: { sectionName: string, html: string }): void {
    this.sectionHtmls[event.sectionName] = event.html; // Update HTML for the specific section
    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(() => {
      const { bg, fg } = this.getThemeColors(this.theme);
      this.updateCombinedHtml(bg, fg);
      this.updateTimer = null;
    }, 200);
  }

  updateCombinedHtml(bgColor?: string, fgColor?: string): void {
    bgColor = bgColor ?? '#000';
    fgColor = fgColor ?? 'white';

    console.log('whiteLogoBase64', this.whiteLogoBase64);
    console.log('blackLogoBase64', this.blackLogoBase64);

    const homeHtml = this.sectionHtmls['home'] || '';
    const nonHomeHtml = Object.entries(this.sectionHtmls)
      .filter(([key]) => key !== 'home')
      .map(([, html]) => html)
      .join('');
    const sectionsContent = homeHtml + nonHomeHtml;

    const useWhiteLogo = (bgColor === '#000') || this.theme === 'dark' || this.theme === 'blue' || this.theme === 'red';
    const logoSrc = useWhiteLogo ? this.whiteLogoBase64 : this.blackLogoBase64;

    console.log(logoSrc);
    // Wrap combined sections content with the full HTML structure
    this.generatedHtml = `
      <!DOCTYPE html>
      <html class="no-js" lang="en">
      <head>
        <meta charset="utf-8">
        <title>kickConnect-HTML-TEMPLATE-1</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          :root { --bg-color: ${bgColor}; --fg-color: ${fgColor}; }
          body { background-color: var(--bg-color); color: var(--fg-color); font-family: Arial, sans-serif; }
          .row { display: flex; flex-wrap: wrap; }
          #header { display:flex; align-items:center; justify-content: space-between; padding: 8px 16px; }
          .header-logo { display:flex; align-items:center; gap:12px; }
          .header-logo img { height: 40px; border-radius: 6px; }
          .brand-title { font-size: 18px; margin: 0; }
          .header-main-nav { list-style: none; display: flex; gap: 16px; padding: 0; margin: 0; }
          .header-main-nav a { color: var(--fg-color); text-decoration: none; font-weight: 500; }
          html { scroll-behavior: smooth; }
          .home-button { position: fixed; bottom: 16px; right: 16px; background: rgba(0,0,0,0.4); color: #fff; padding: 8px 10px; border-radius: 20px; text-decoration: none; }
          .home-button:hover { background: rgba(0,0,0,0.6); }
        </style>
      </head>
      <body>
        <header id="header" class="row">
          <div class="header-logo">
            <img src="${logoSrc}">
            <h1 class="brand-title">kickConnect</h1>
          </div>
          <nav id="header-nav-wrap">
            <ul class="header-main-nav">
              ${this.generateMenuItemsHtml()} 
            </ul>
          </nav>
        </header><br/><br/><br/><br/>
        ${sectionsContent}
        <a class="home-button" href="#top" aria-label="Back to top">↑ Home</a>
      </body>
      </html>`;

    this.updateIframeSrc();
  }
    // this.columnColor = 'white';
    // this.col1HeaderText = 'Column 1';
    // this.col1TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    // this.col2HeaderText = 'Column 2';
    // this.col2TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    // this.col3HeaderText = 'Column 3';
    // this.col3TextBlock = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.';
    // this.currentSection = 1;
    // this.columnCount = 1;

  generateMenuItemsHtml(): string {
    const home = `<li><a class="smoothscroll" href="#${this.homeSection.sectionName}" title="${this.homeSection.menuTitle}">${this.homeSection.menuTitle}</a></li>`;
    const pages = this.sections.map((section) => `<li><a class="smoothscroll" href="#${section.sectionName}" title="${section.menuTitle}">${section.menuTitle}</a></li>`).join('');
    return home + pages;
  }

  updateIframeSrc(): void {
    const blob = new Blob([this.generatedHtml], { type: 'text/html' });
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  getThemeColors(theme: 'light' | 'dark' | 'gold' | 'blue' | 'red'): { bg: string; fg: string } {
    const bg = theme === 'dark' ? '#000' : theme === 'gold' ? '#FFD700' : theme === 'blue' ? '#0f4c81' : theme === 'red' ? '#b91c1c' : '#fff';
    let fg: string;
    if (this.textColorMode === 'red') {
      fg = '#b91c1c';
    } else if (this.textColorMode === 'gold') {
      fg = '#FFD700';
    } else if (this.textColorMode === 'light') {
      fg = '#fff';
    } else if (this.textColorMode === 'dark') {
      fg = '#000';
    } else {
      // auto: dark/blue/red -> white text; light -> black; gold -> black for readability
      if (theme === 'dark' || theme === 'blue' || theme === 'red') fg = '#fff';
      else if (theme === 'gold') fg = '#000';
      else fg = '#000';
    }
    return { bg, fg };
  }

  downloadHtml(): void {
    const blob = new Blob([this.generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kickConnect-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
