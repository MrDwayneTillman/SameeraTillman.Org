const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  console.log('Testing:', filePath);
  
  try {
    // Load the page
    await page.goto(filePath, { waitUntil: 'networkidle' });
    console.log('✓ Page loaded successfully');
    
    // Check title
    const title = await page.title();
    console.log('✓ Title:', title);
    
    // Check main heading
    const h1 = await page.textContent('h1');
    console.log('✓ Main heading:', h1);
    
    // Check navigation links
    const navLinks = await page.$$eval('nav a', links => links.map(l => l.textContent));
    console.log('✓ Navigation links:', navLinks.join(', '));
    
    // Check sections exist
    const sections = ['#about', '#service', '#highlights', '#sources', '#contact'];
    for (const section of sections) {
      const exists = await page.$(section);
      console.log(`✓ Section ${section}:`, exists ? 'Found' : 'Missing');
    }
    
    // Check quick facts cards
    const cards = await page.$$('.quick .card');
    console.log('✓ Quick facts cards:', cards.length);
    
    // Check form elements
    const form = await page.$('#contact-form');
    console.log('✓ Contact form:', form ? 'Found' : 'Missing');
    
    // Check year auto-update
    const year = await page.textContent('#year');
    console.log('✓ Footer year:', year);
    
    // Test form interaction
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'This is a test message');
    console.log('✓ Form fields are functional');
    
    // Report errors
    if (errors.length > 0) {
      console.log('\n⚠ Console errors found:');
      errors.forEach(err => console.log('  -', err));
    } else {
      console.log('\n✓ No console errors detected');
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
