const { chromium } = require('playwright');
const path = require('path');

(async () => {
  try {
    console.log('Initializing Playwright PDF Engine...');
    const browser = await chromium.launch({
      headless: true
    });
    
    const page = await browser.newPage();
    
    // Resolve absolute path to the newly created HTML guide
    const htmlPath = path.resolve(__dirname, 'client_demo_guide.html');
    const fileUrl = 'file://' + (process.platform === 'win32' ? '/' + htmlPath.replace(/\\/g, '/') : htmlPath);
    
    console.log(`Loading User Guide: ${fileUrl}`);
    await page.goto(fileUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Apply print layouts and media options
    await page.emulateMedia({ media: 'print' });
    
    console.log('Generating high-resolution print PDF...');
    await page.pdf({
      path: path.join(__dirname, 'NyayNow_Complete_Demo_Guide.pdf'),
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '12mm',
        right: '12mm'
      }
    });
    
    console.log('PDF Compiled Successfully: NyayNow_Complete_Demo_Guide.pdf');
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Fatal compilation failure in PDF Engine:', error);
    process.exit(1);
  }
})();
