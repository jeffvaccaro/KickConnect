import { MatButtonToggleChange } from "@angular/material/button-toggle";

export function generateContentForColumn(
  type: string, 
  header: string, 
  text: string, 
  content: string = '', 
  columnColor: string
): string {
  if (type === 'text') {
    return `
      <div class="service-content">
        <h3 style="color:${columnColor};">${header}</h3>
        <p style="color:${columnColor};">${text}</p>
      </div>
    `;
  } else if (type === 'image') {
    return `
      <div class="service-content">
        <h3 style="color:${columnColor};">${header}</h3>
        <p style="color:${columnColor};"><img src="${text}"></p>
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

export function section1Columns(
  event: MatButtonToggleChange, 
  columnColor: string, 
  col1HeaderText: string, 
  col1TextBlock: string, 
  col2HeaderText: string, 
  col2TextBlock: string, 
  col3HeaderText: string, 
  col3TextBlock: string,
  col2Image: string,
  col3Image: string
): { 
  colBlockHTML: string; 
  col1: boolean; 
  col2: boolean; 
  col3: boolean;
  colBlock: string;
} {
  let columnCount = event.value;
  let colBlock = 'features-list block-1-' + event.value; 
  let colBlockHTML = '';
  let col1 = false;
  let col2 = false;
  let col3 = false;

  if (event.value == 1) {
    colBlockHTML = `
    <div class="bgrid feature" style="width:85%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      ${generateContentForColumn('text', col1HeaderText, col1TextBlock, '', columnColor)}
    </div>`;
    col1 = true;
  } else if (event.value == 2) {
    colBlockHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
      <div class="bgrid feature block-1-2" style="flex: 1; max-width: 45%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('text', col1HeaderText, col1TextBlock, '', columnColor)}
      </div>`;
      if(col2Image == "" || col2Image == undefined){
        colBlockHTML +=
        `<div class="bgrid feature block-1-2" style="flex: 1; max-width: 45%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('text', col2HeaderText, col2TextBlock, '', columnColor)}
        </div>`;
      }else{
        colBlockHTML +=
        `<div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('image', col2HeaderText, col2Image, '', columnColor)}
        </div>`;
      }
    colBlockHTML += `</div>`;

    col1 = true;
    col2 = true;
  } else if (event.value == 3) {

    colBlockHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
      <div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('text', col1HeaderText, col1TextBlock, '', columnColor)}
      </div>`;
      if(col2Image == "" || col2Image == undefined){
        colBlockHTML += 
        `<div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
          ${generateContentForColumn('text', col2HeaderText, col2TextBlock, '', columnColor)}
        </div>`;
      }else{
        colBlockHTML += 
        `<div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
          ${generateContentForColumn('image', col2HeaderText, col2Image, '', columnColor)}
        </div>`;        
      }
      if(col3Image == "" || col3Image == undefined){
        colBlockHTML += 
        `<div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('text', col3HeaderText, col3TextBlock, '', columnColor)}
        </div>`;
      }else{
        colBlockHTML +=
        `<div class="bgrid feature block-1-3" style="flex: 1; max-width: 30%; margin: 0 10px; height: 85vh;">
        ${generateContentForColumn('image', col3HeaderText, col3Image, '', columnColor)}
        </div>`;
      }
    colBlockHTML += `</div>`;
    
    col1 = true;
    col2 = true;
    col3 = true;
  }

  return { colBlockHTML, col1, col2, col3, colBlock };
}
