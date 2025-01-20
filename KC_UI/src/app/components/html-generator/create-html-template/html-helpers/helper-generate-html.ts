// htmlHelper.ts
export function setBackground(imageUrl: string, colBlock: string): string {
    const backgroundImage = `
      <style>
        .${colBlock.replace(/ /g, ".")} {
        width: 100vw;
        margin: 0;
        padding: 0;
        background-image: url('${imageUrl}');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        }
      </style>`;
      return backgroundImage;
  }

export function generateHtml(
    menuItems: { name: string, href: string }[],
    bgImgURL: string,
    colBlock: string,
    colBlockHTML: string    
  ): string {
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
    
    const section1a = `<br/><br/>
      <section id="section1" style="background-image: url('${bgImgURL}'); background-size: cover; background-repeat: no-repeat; background-position: center; height: 100vh;">
        <div class="row about-features">
            <div>
              ${colBlockHTML}
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
  
    return htmlHeader + htmlStartHeader + htmlMenuItems + htmlEndHeader + section1a + section1b + footer;
  }
  