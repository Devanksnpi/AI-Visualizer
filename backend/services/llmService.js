const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class LLMService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.openai = null;
    this.isInitialized = false;
    this.serviceType = null; // 'gemini' or 'openai'
  }

  async initialize() {
    try {
      if (process.env.GEMINI_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.isInitialized = true;
        this.serviceType = 'gemini';
        console.log('✅ Google Gemini service initialized');
      } else if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.isInitialized = true;
        this.serviceType = 'openai';
        console.log('✅ OpenAI service initialized');
      } else {
        console.warn('⚠️  No API key found. Using mock responses.');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize LLM service:', error);
      this.isInitialized = false;
    }
  }

  async generateAnswer(question) {
    if (!this.isInitialized) {
      return this.getMockResponse(question);
    }

    try {
      const prompt = this.buildPrompt(question);
      
      if (this.serviceType === 'gemini') {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        // Try to parse JSON response
        try {
          // Remove markdown code blocks if present
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsed = JSON.parse(cleanContent);
          return {
            text: parsed.text,
            visualization: parsed.visualization
          };
        } catch (parseError) {
          console.error('Failed to parse Gemini response as JSON:', parseError);
          console.log('Raw response:', content);
          return this.getMockResponse(question);
        }
      } else if (this.serviceType === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that explains scientific concepts with both clear text explanations and detailed visualization specifications. Always respond with valid JSON containing 'text' and 'visualization' fields."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        const content = response.choices[0].message.content;
        
        // Try to parse JSON response
        try {
          // Remove markdown code blocks if present
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsed = JSON.parse(cleanContent);
          return {
            text: parsed.text,
            visualization: parsed.visualization
          };
        } catch (parseError) {
          console.error('Failed to parse OpenAI response as JSON:', parseError);
          return this.getMockResponse(question);
        }
      }

    } catch (error) {
      console.error(`${this.serviceType} API Error:`, error);
      return this.getMockResponse(question);
    }
  }

  buildPrompt(question) {
    return `You are an AI assistant that creates educational visualizations for scientific concepts. 

Question: "${question}"

       Please respond with ONLY a valid JSON object containing:
       1. "text": A clear, educational explanation in simple language (2-3 sentences)
       2. "visualization": A detailed JSON specification for an interactive animation
       3. "visualization_type": "canvas", "manim", "plot", "svg", or "physics" (choose the most appropriate)
       4. "manim_code": Complete Python Manim code (only if visualization_type is "manim")
       5. "plot_code": Complete Python Matplotlib/Plotly code (only if visualization_type is "plot")
       6. "svg_code": Complete SVG code (only if visualization_type is "svg")
       7. "physics_code": Complete Python physics simulation code (only if visualization_type is "physics")

IMPORTANT: Respond with ONLY the JSON object, no additional text or explanations.

VISUALIZATION TYPE GUIDELINES:

1. "manim" - For physics/math animations requiring precise mathematical accuracy:
   - Newton's laws, wave motion, orbital mechanics, electromagnetic fields
   - Thermodynamics, quantum mechanics, fluid dynamics, calculus concepts
   - Create 10-20 second animations with detailed explanations and multiple phases
   - Use self.wait() calls to pause between sections for better understanding

2. "plot" - For data visualization, scientific plots, and mathematical functions:
   - Function graphs, statistical plots, chemical reaction kinetics
   - Data analysis, scientific simulations, mathematical modeling
   - Use Matplotlib for static plots or Plotly for interactive visualizations

3. "svg" - For technical diagrams and structural representations:
   - Circuit diagrams, flowcharts, molecular structures, network topologies
   - Technical schematics, process flows, architectural diagrams
   - Use clean, professional SVG with proper labels and annotations

4. "physics" - For complex physics simulations requiring accurate physics engines:
   - Collision dynamics, fluid mechanics, electromagnetic fields
   - Pendulum motion, particle systems, wave propagation
   - Use PyMunk, NumPy, SciPy for realistic physics calculations
   - Generate both visualizations and numerical data

5. "canvas" - For simple interactive animations and basic concepts:
   - Basic shapes, simple motion, elementary concepts
   - Fallback for concepts that don't fit the above categories

The visualization must follow this exact structure:
{
  "text": "Your explanation here",
  "visualization": {
    "id": "unique_id",
    "duration": 4000,
    "fps": 30,
    "layers": [
      {
        "id": "element_id",
        "type": "circle|rectangle|arrow|line|text",
        "props": { /* element properties */ },
        "animations": [
          {
            "property": "x|y|r|width|height|orbit",
            "from": start_value,
            "to": end_value,
            "start": start_time_ms,
            "end": end_time_ms,
            "duration": duration_ms (for orbit)
          }
        ]
      }
    ]
  }
}

Available element types and their enhanced props:

**Basic Shapes:**
- circle: x, y, r, fill, stroke, strokeWidth, gradient, shadow, glow
- rectangle: x, y, width, height, fill, stroke, strokeWidth, gradient, shadow, borderRadius
- ellipse: x, y, rx, ry, fill, stroke, strokeWidth, gradient, shadow, rotation
- polygon: points (array of {x, y}), fill, stroke, strokeWidth, gradient, shadow
- path: path (SVG path string), fill, stroke, strokeWidth, gradient, shadow

**Lines and Arrows:**
- line: x1, y1, x2, y2, color, strokeWidth, gradient, dash, glow
- arrow: x, y, dx, dy, color, strokeWidth, gradient, glow, headSize

**Text:**
- text: x, y, text, fontSize, color, fontFamily, stroke, strokeWidth, shadow, background

**Enhanced Visual Effects:**
- gradient: {from: "color1", to: "color2"} for smooth color transitions
- shadow: "rgba(0,0,0,0.3)" for drop shadows
- glow: "color" for glowing effects
- dash: [5, 5] for dashed lines
- borderRadius: number for rounded rectangles
- background: {color: "rgba(255,255,255,0.9)"} for text backgrounds

**Animation Properties:**
- For orbital motion: property "orbit" with centerX, centerY, radius, duration
- For other animations: property, from, to, start, end

**Color Suggestions:**
- Use vibrant, educational colors: #FF6B6B (red), #4ECDC4 (teal), #45B7D1 (blue), #96CEB4 (green), #FFEAA7 (yellow), #DDA0DD (plum)
- Use gradients for depth: {from: "#FF6B6B", to: "#FF8E8E"}
- Use shadows for 3D effect: "rgba(0,0,0,0.3)"

Create visually stunning, educational visualizations with smooth animations, gradients, shadows, and professional styling!`;
  }

  getMockResponse(question) {
    const questionLower = question.toLowerCase();
    
    // Newton's First Law
    if (questionLower.includes('newton') && questionLower.includes('first')) {
      return {
        text: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force. This is also known as the law of inertia.",
        visualization: {
          id: "newton_first_law",
          duration: 4000,
          fps: 30,
          layers: [
            {
              id: "ball1",
              type: "circle",
              props: { 
                x: 100, y: 200, r: 25, 
                fill: "#45B7D1", 
                gradient: {from: "#45B7D1", to: "#87CEEB"},
                shadow: "rgba(0,0,0,0.3)",
                stroke: "#2C3E50", 
                strokeWidth: 2
              },
              animations: [
                { property: "x", from: 100, to: 400, start: 0, end: 3000 }
              ]
            },
            {
              id: "ball2",
              type: "circle",
              props: { 
                x: 100, y: 300, r: 25, 
                fill: "#FF6B6B", 
                gradient: {from: "#FF6B6B", to: "#FF8E8E"},
                shadow: "rgba(0,0,0,0.3)",
                stroke: "#2C3E50", 
                strokeWidth: 2
              },
              animations: []
            },
            {
              id: "arrow1",
              type: "arrow",
              props: { 
                x: 90, y: 200, dx: 40, dy: 0, 
                color: "#E74C3C", 
                strokeWidth: 4,
                glow: "#E74C3C",
                headSize: 15
              },
              animations: []
            },
            {
              id: "text1",
              type: "text",
              props: { 
                x: 250, y: 150, 
                text: "Moving ball continues moving", 
                fontSize: 18, 
                color: "#2C3E50",
                fontFamily: "Arial, sans-serif",
                background: {color: "rgba(255,255,255,0.9)"},
                shadow: "rgba(0,0,0,0.2)"
              },
              animations: []
            },
            {
              id: "text2",
              type: "text",
              props: { 
                x: 250, y: 350, 
                text: "Stationary ball stays at rest", 
                fontSize: 18, 
                color: "#2C3E50",
                fontFamily: "Arial, sans-serif",
                background: {color: "rgba(255,255,255,0.9)"},
                shadow: "rgba(0,0,0,0.2)"
              },
              animations: []
            }
          ]
        }
      };
    }

    // Solar System
    if (questionLower.includes('solar system') || questionLower.includes('planets')) {
      return {
        text: "The Solar System consists of the Sun at the center with planets orbiting around it due to gravitational pull. The inner planets orbit faster than the outer planets.",
        visualization: {
          id: "solar_system",
          duration: 6000,
          fps: 30,
          layers: [
            {
              id: "sun",
              type: "circle",
              props: { 
                x: 300, y: 300, r: 45, 
                fill: "#FFD700", 
                gradient: {from: "#FFD700", to: "#FFA500"},
                glow: "#FFD700",
                shadow: "rgba(0,0,0,0.3)"
              },
              animations: []
            },
            {
              id: "earth",
              type: "circle",
              props: { 
                x: 200, y: 300, r: 18, 
                fill: "#4ECDC4", 
                gradient: {from: "#4ECDC4", to: "#87CEEB"},
                shadow: "rgba(0,0,0,0.3)",
                stroke: "#2C3E50", 
                strokeWidth: 2
              },
              animations: [
                { property: "orbit", centerX: 300, centerY: 300, radius: 100, duration: 3000 }
              ]
            },
            {
              id: "mars",
              type: "circle",
              props: { 
                x: 150, y: 300, r: 15, 
                fill: "#FF6B6B", 
                gradient: {from: "#FF6B6B", to: "#FF8E8E"},
                shadow: "rgba(0,0,0,0.3)",
                stroke: "#2C3E50", 
                strokeWidth: 2
              },
              animations: [
                { property: "orbit", centerX: 300, centerY: 300, radius: 150, duration: 6000 }
              ]
            },
            {
              id: "orbit_earth",
              type: "circle",
              props: { 
                x: 300, y: 300, r: 100, 
                fill: "transparent", 
                stroke: "#34495e", 
                strokeWidth: 2,
                dash: [5, 5]
              },
              animations: []
            },
            {
              id: "orbit_mars",
              type: "circle",
              props: { 
                x: 300, y: 300, r: 150, 
                fill: "transparent", 
                stroke: "#34495e", 
                strokeWidth: 2,
                dash: [5, 5]
              },
              animations: []
            },
            {
              id: "title",
              type: "text",
              props: { 
                x: 300, y: 50, 
                text: "Solar System", 
                fontSize: 24, 
                color: "#2C3E50",
                fontFamily: "Arial, sans-serif",
                background: {color: "rgba(255,255,255,0.9)"},
                shadow: "rgba(0,0,0,0.2)"
              },
              animations: []
            }
          ]
        }
      };
    }

    // Photosynthesis
    if (questionLower.includes('photosynthesis')) {
      return {
        text: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in the chloroplasts of plant cells.",
        visualization: {
          id: "photosynthesis",
          duration: 5000,
          fps: 30,
          layers: [
            {
              id: "sun",
              type: "circle",
              props: { x: 150, y: 100, r: 25, fill: "#f1c40f" },
              animations: []
            },
            {
              id: "plant",
              type: "rectangle",
              props: { x: 200, y: 200, width: 20, height: 100, fill: "#27ae60" },
              animations: []
            },
            {
              id: "co2_arrow",
              type: "arrow",
              props: { x: 300, y: 250, dx: -80, dy: -30, color: "#e74c3c", strokeWidth: 3 },
              animations: [
                { property: "x", from: 300, to: 220, start: 0, end: 2000 }
              ]
            },
            {
              id: "h2o_arrow",
              type: "arrow",
              props: { x: 200, y: 350, dx: 0, dy: -100, color: "#3498db", strokeWidth: 3 },
              animations: [
                { property: "y", from: 350, to: 250, start: 0, end: 2000 }
              ]
            },
            {
              id: "o2_arrow",
              type: "arrow",
              props: { x: 220, y: 200, dx: 80, dy: -50, color: "#2ecc71", strokeWidth: 3 },
              animations: [
                { property: "x", from: 220, to: 300, start: 2000, end: 4000 }
              ]
            },
            {
              id: "text_co2",
              type: "text",
              props: { x: 320, y: 240, text: "CO₂", fontSize: 14, color: "#e74c3c" },
              animations: []
            },
            {
              id: "text_h2o",
              type: "text",
              props: { x: 180, y: 360, text: "H₂O", fontSize: 14, color: "#3498db" },
              animations: []
            },
            {
              id: "text_o2",
              type: "text",
              props: { x: 320, y: 140, text: "O₂", fontSize: 14, color: "#2ecc71" },
              animations: []
            }
          ]
        }
      };
    }

    // Default response
    return {
      text: "I understand you're asking about: " + question + ". This is a mock response. To get real AI-generated explanations and visualizations, please configure an OpenAI API key in your environment variables.",
      visualization: {
        id: "default_visualization",
        duration: 3000,
        fps: 30,
        layers: [
          {
            id: "demo_circle",
            type: "circle",
            props: { x: 200, y: 200, r: 30, fill: "#9b59b6" },
            animations: [
              { property: "r", from: 30, to: 50, start: 0, end: 1500 },
              { property: "r", from: 50, to: 30, start: 1500, end: 3000 }
            ]
          },
          {
            id: "demo_text",
            type: "text",
            props: { x: 200, y: 280, text: "Demo Visualization", fontSize: 16, color: "#2c3e50" },
            animations: []
          }
        ]
      }
    };
  }
}

module.exports = new LLMService();
