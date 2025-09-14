const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SvgService {
  constructor() {
    this.isInitialized = false;
    this.outputDir = path.join(__dirname, '../public/svg');
  }

  async initialize() {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.outputDir, { recursive: true });
      this.isInitialized = true;
      console.log('✅ SVG service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SVG service:', error.message);
      this.isInitialized = false;
    }
  }

  async generateSvg(svgCode, concept, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️  SVG service not available, falling back to canvas visualization');
      return {
        success: false,
        error: 'SVG service not available',
        fallbackToCanvas: true
      };
    }

    const sessionId = uuidv4();
    const svgPath = path.join(this.outputDir, `${sessionId}.svg`);

    try {
      // Write SVG to file
      await fs.writeFile(svgPath, svgCode, 'utf8');

      // Return the public URL for the SVG
      return {
        success: true,
        svgUrl: `/svg/${sessionId}.svg`,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('❌ Error generating SVG:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackToCanvas: true
      };
    }
  }

  // Generate SVG templates for common technical concepts
  getSvgTemplate(concept) {
    const templates = {
      'circuit_diagram': `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
     refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
    </marker>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Title -->
  <text x="400" y="40" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="#333">Simple Electrical Circuit</text>
  
  <!-- Battery -->
  <rect x="100" y="250" width="40" height="100" fill="#ffd700" stroke="#333" stroke-width="2"/>
  <text x="120" y="240" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Battery</text>
  <text x="120" y="370" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" fill="#333">12V</text>
  
  <!-- Positive terminal -->
  <line x1="140" y1="250" x2="140" y2="200" stroke="#333" stroke-width="3"/>
  <text x="150" y="220" font-family="Arial, sans-serif" font-size="12" fill="#333">+</text>
  
  <!-- Negative terminal -->
  <line x1="100" y1="250" x2="100" y2="200" stroke="#333" stroke-width="3"/>
  <text x="80" y="220" font-family="Arial, sans-serif" font-size="12" fill="#333">-</text>
  
  <!-- Resistor -->
  <rect x="300" y="280" width="80" height="40" fill="#8b4513" stroke="#333" stroke-width="2"/>
  <text x="340" y="270" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Resistor</text>
  <text x="340" y="340" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" fill="#333">10Ω</text>
  
  <!-- LED -->
  <polygon points="500,300 520,280 540,300 520,320" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
  <line x1="520" y1="280" x2="520" y2="260" stroke="#333" stroke-width="2"/>
  <line x1="520" y1="320" x2="520" y2="340" stroke="#333" stroke-width="2"/>
  <text x="520" y="250" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">LED</text>
  
  <!-- Switch -->
  <line x1="200" y1="200" x2="220" y2="200" stroke="#333" stroke-width="3"/>
  <line x1="220" y1="200" x2="240" y2="180" stroke="#333" stroke-width="3"/>
  <circle cx="200" cy="200" r="3" fill="#333"/>
  <circle cx="240" cy="180" r="3" fill="#333"/>
  <text x="220" y="160" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Switch</text>
  
  <!-- Connecting wires -->
  <line x1="140" y1="200" x2="200" y2="200" stroke="#333" stroke-width="3"/>
  <line x1="240" y1="180" x2="300" y2="180" stroke="#333" stroke-width="3"/>
  <line x1="300" y1="180" x2="300" y2="280" stroke="#333" stroke-width="3"/>
  <line x1="380" y1="300" x2="500" y2="300" stroke="#333" stroke-width="3"/>
  <line x1="520" y1="340" x2="520" y2="400" stroke="#333" stroke-width="3"/>
  <line x1="520" y1="400" x2="100" y2="400" stroke="#333" stroke-width="3"/>
  <line x1="100" y1="400" x2="100" y2="350" stroke="#333" stroke-width="3"/>
  
  <!-- Current flow arrows -->
  <line x1="250" y1="190" x2="280" y2="190" stroke="#ff0000" stroke-width="2" 
        marker-end="url(#arrowhead)"/>
  <text x="265" y="185" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="10" fill="#ff0000">I</text>
  
  <line x1="440" y1="290" x2="470" y2="290" stroke="#ff0000" stroke-width="2" 
        marker-end="url(#arrowhead)"/>
  <text x="455" y="285" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="10" fill="#ff0000">I</text>
  
  <!-- Voltage labels -->
  <text x="200" y="120" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="16" font-weight="bold" fill="#0066cc">V = 12V</text>
  <text x="340" y="120" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="16" font-weight="bold" fill="#0066cc">R = 10Ω</text>
  <text x="520" y="120" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="16" font-weight="bold" fill="#0066cc">LED</text>
  
  <!-- Ohm's Law -->
  <text x="400" y="500" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="18" font-weight="bold" fill="#333">Ohm's Law: V = I × R</text>
  <text x="400" y="530" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Current (I) = 12V ÷ 10Ω = 1.2A</text>
</svg>`,

      'flowchart': `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Title -->
  <text x="400" y="40" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="#333">Algorithm Flowchart</text>
  
  <!-- Start -->
  <ellipse cx="400" cy="100" rx="80" ry="30" fill="#e8f5e8" stroke="#28a745" stroke-width="2"/>
  <text x="400" y="105" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="#333">START</text>
  
  <!-- Input -->
  <rect x="320" y="160" width="160" height="40" fill="#fff3cd" stroke="#ffc107" stroke-width="2"/>
  <text x="400" y="185" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Input Data</text>
  
  <!-- Process -->
  <rect x="320" y="240" width="160" height="40" fill="#d1ecf1" stroke="#17a2b8" stroke-width="2"/>
  <text x="400" y="265" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Process Data</text>
  
  <!-- Decision -->
  <polygon points="400,320 480,360 400,400 320,360" fill="#f8d7da" stroke="#dc3545" stroke-width="2"/>
  <text x="400" y="355" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" fill="#333">Valid?</text>
  
  <!-- Yes path -->
  <rect x="520" y="350" width="120" height="40" fill="#d4edda" stroke="#28a745" stroke-width="2"/>
  <text x="580" y="375" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Output Result</text>
  
  <!-- No path -->
  <rect x="160" y="350" width="120" height="40" fill="#f8d7da" stroke="#dc3545" stroke-width="2"/>
  <text x="220" y="375" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Error Message</text>
  
  <!-- End -->
  <ellipse cx="400" cy="480" rx="80" ry="30" fill="#e8f5e8" stroke="#28a745" stroke-width="2"/>
  <text x="400" y="485" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="#333">END</text>
  
  <!-- Arrows -->
  <line x1="400" y1="130" x2="400" y2="160" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="400" y1="200" x2="400" y2="240" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="400" y1="280" x2="400" y2="320" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  
  <!-- Decision arrows -->
  <line x1="480" y1="360" x2="520" y2="370" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="500" y="365" font-family="Arial, sans-serif" font-size="12" fill="#333">Yes</text>
  
  <line x1="320" y1="360" x2="280" y2="370" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="300" y="365" font-family="Arial, sans-serif" font-size="12" fill="#333">No</text>
  
  <!-- End arrows -->
  <line x1="580" y1="390" x2="580" y2="450" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="220" y1="390" x2="220" y2="450" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  
  <!-- Arrow marker definition -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
     refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
    </marker>
  </defs>
</svg>`,

      'molecular_structure': `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Title -->
  <text x="400" y="40" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="#333">Water Molecule (H₂O)</text>
  
  <!-- Oxygen atom -->
  <circle cx="400" cy="300" r="30" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
  <text x="400" y="305" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="16" font-weight="bold" fill="white">O</text>
  
  <!-- Hydrogen atoms -->
  <circle cx="320" cy="250" r="20" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
  <text x="320" y="255" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="white">H</text>
  
  <circle cx="480" cy="250" r="20" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
  <text x="480" y="255" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="white">H</text>
  
  <!-- Bonds -->
  <line x1="340" y1="260" x2="370" y2="290" stroke="#333" stroke-width="4"/>
  <line x1="460" y1="260" x2="430" y2="290" stroke="#333" stroke-width="4"/>
  
  <!-- Bond angles -->
  <path d="M 320 250 A 80 80 0 0 1 480 250" stroke="#666" stroke-width="1" fill="none" stroke-dasharray="5,5"/>
  <text x="400" y="220" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" fill="#666">104.5°</text>
  
  <!-- Labels -->
  <text x="400" y="370" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="16" font-weight="bold" fill="#333">Oxygen (O)</text>
  <text x="320" y="200" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Hydrogen (H)</text>
  <text x="480" y="200" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#333">Hydrogen (H)</text>
  
  <!-- Properties -->
  <text x="50" y="450" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Properties:</text>
  <text x="50" y="470" font-family="Arial, sans-serif" font-size="12" fill="#333">• Molecular Formula: H₂O</text>
  <text x="50" y="485" font-family="Arial, sans-serif" font-size="12" fill="#333">• Bond Angle: 104.5°</text>
  <text x="50" y="500" font-family="Arial, sans-serif" font-size="12" fill="#333">• Polarity: Polar molecule</text>
  <text x="50" y="515" font-family="Arial, sans-serif" font-size="12" fill="#333">• Hydrogen bonding capability</text>
  
  <!-- Electron pairs -->
  <circle cx="400" cy="300" r="50" fill="none" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
  <text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="10" fill="#ff6b6b">Lone pairs</text>
</svg>`,

      'network_diagram': `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Title -->
  <text x="400" y="40" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="#333">Network Topology</text>
  
  <!-- Router -->
  <rect x="350" y="200" width="100" height="60" fill="#007bff" stroke="#333" stroke-width="2" rx="10"/>
  <text x="400" y="235" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="white">Router</text>
  
  <!-- Servers -->
  <rect x="150" y="100" width="80" height="50" fill="#28a745" stroke="#333" stroke-width="2" rx="5"/>
  <text x="190" y="130" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" font-weight="bold" fill="white">Server 1</text>
  
  <rect x="150" y="300" width="80" height="50" fill="#28a745" stroke="#333" stroke-width="2" rx="5"/>
  <text x="190" y="330" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" font-weight="bold" fill="white">Server 2</text>
  
  <!-- Clients -->
  <rect x="550" y="100" width="80" height="50" fill="#ffc107" stroke="#333" stroke-width="2" rx="5"/>
  <text x="590" y="130" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" font-weight="bold" fill="#333">Client 1</text>
  
  <rect x="550" y="200" width="80" height="50" fill="#ffc107" stroke="#333" stroke-width="2" rx="5"/>
  <text x="590" y="230" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" font-weight="bold" fill="#333">Client 2</text>
  
  <rect x="550" y="300" width="80" height="50" fill="#ffc107" stroke="#333" stroke-width="2" rx="5"/>
  <text x="590" y="330" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="12" font-weight="bold" fill="#333">Client 3</text>
  
  <!-- Connections -->
  <line x1="230" y1="125" x2="350" y2="215" stroke="#333" stroke-width="2"/>
  <line x1="230" y1="325" x2="350" y2="245" stroke="#333" stroke-width="2"/>
  <line x1="450" y1="215" x2="550" y2="125" stroke="#333" stroke-width="2"/>
  <line x1="450" y1="230" x2="550" y2="225" stroke="#333" stroke-width="2"/>
  <line x1="450" y1="245" x2="550" y2="325" stroke="#333" stroke-width="2"/>
  
  <!-- Data flow arrows -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
     refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
    </marker>
  </defs>
  
  <line x1="250" y1="120" x2="300" y2="180" stroke="#007bff" stroke-width="2" 
        marker-end="url(#arrowhead)"/>
  <text x="275" y="150" font-family="Arial, sans-serif" font-size="10" fill="#007bff">Request</text>
  
  <line x1="300" y1="180" x2="250" y2="120" stroke="#28a745" stroke-width="2" 
        marker-end="url(#arrowhead)"/>
  <text x="275" y="160" font-family="Arial, sans-serif" font-size="10" fill="#28a745">Response</text>
  
  <!-- Legend -->
  <rect x="50" y="450" width="200" height="120" fill="white" stroke="#333" stroke-width="1" rx="5"/>
  <text x="150" y="470" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="#333">Legend</text>
  
  <rect x="70" y="480" width="20" height="15" fill="#007bff"/>
  <text x="100" y="492" font-family="Arial, sans-serif" font-size="12" fill="#333">Router</text>
  
  <rect x="70" y="500" width="20" height="15" fill="#28a745"/>
  <text x="100" y="512" font-family="Arial, sans-serif" font-size="12" fill="#333">Server</text>
  
  <rect x="70" y="520" width="20" height="15" fill="#ffc107"/>
  <text x="100" y="532" font-family="Arial, sans-serif" font-size="12" fill="#333">Client</text>
  
  <line x1="70" y1="540" x2="90" y2="540" stroke="#333" stroke-width="2"/>
  <text x="100" y="545" font-family="Arial, sans-serif" font-size="12" fill="#333">Connection</text>
</svg>`
    };

    return templates[concept] || templates['circuit_diagram'];
  }
}

module.exports = new SvgService();
