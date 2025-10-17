import sharp from 'sharp';

// Create a 1200x675 image with a gradient background
const width = 1200;
const height = 675;

const generateImage = async () => {
  try {
    // Create a gradient background
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      
      <!-- Grid pattern -->
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#grid)" />
      
      <!-- Contest list mockup -->
      <rect x="40" y="120" width="340" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="70" y="140" width="200" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <rect x="300" y="140" width="60" height="20" rx="4" fill="rgba(79,70,229,0.8)" />
      
      <rect x="40" y="200" width="340" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="70" y="220" width="180" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <rect x="300" y="220" width="60" height="20" rx="4" fill="rgba(239,68,68,0.8)" />
      
      <rect x="40" y="280" width="340" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="70" y="300" width="220" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <rect x="300" y="300" width="60" height="20" rx="4" fill="rgba(249,115,22,0.8)" />
      
      <rect x="40" y="360" width="340" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="70" y="380" width="190" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <rect x="300" y="380" width="60" height="20" rx="4" fill="rgba(79,70,229,0.8)" />
      
      <!-- Calendar view mockup -->
      <rect x="420" y="120" width="700" height="320" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="450" y="150" width="640" height="40" rx="4" fill="rgba(255,255,255,0.05)" />
      <text x="480" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Mon</text>
      <text x="580" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Tue</text>
      <text x="680" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Wed</text>
      <text x="780" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Thu</text>
      <text x="880" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Fri</text>
      <text x="980" y="175" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)">Sat/Sun</text>
      
      <!-- Calendar cells -->
      <rect x="450" y="200" width="100" height="80" rx="4" fill="rgba(79,70,229,0.2)" />
      <rect x="560" y="200" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="670" y="200" width="100" height="80" rx="4" fill="rgba(239,68,68,0.2)" />
      <rect x="780" y="200" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="890" y="200" width="100" height="80" rx="4" fill="rgba(249,115,22,0.2)" />
      <rect x="1000" y="200" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      
      <rect x="450" y="290" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="560" y="290" width="100" height="80" rx="4" fill="rgba(79,70,229,0.2)" />
      <rect x="670" y="290" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="780" y="290" width="100" height="80" rx="4" fill="rgba(239,68,68,0.2)" />
      <rect x="890" y="290" width="100" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="1000" y="290" width="100" height="80" rx="4" fill="rgba(249,115,22,0.2)" />
      
      <!-- Nav bar -->
      <rect x="40" y="40" width="1120" height="60" rx="8" fill="rgba(255,255,255,0.1)" />
      <rect x="70" y="60" width="180" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <circle cx="1040" cy="70" r="15" fill="rgba(79,70,229,0.8)" />
      <circle cx="1090" cy="70" r="15" fill="rgba(255,255,255,0.2)" />
      
      <!-- Decorative elements -->
      <circle cx="120" cy="520" r="40" fill="rgba(79,70,229,0.3)" />
      <circle cx="1080" cy="520" r="40" fill="rgba(239,68,68,0.3)" />
      <circle cx="600" cy="550" r="30" fill="rgba(249,115,22,0.3)" />
      
      <text x="600" y="520" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="rgba(255,255,255,0.8)">ContestNotify Dashboard</text>
    </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile('public/mockup.png');
    
    console.log('Mockup image generated successfully!');
  } catch (error) {
    console.error('Error generating mockup image:', error);
  }
};

generateImage();