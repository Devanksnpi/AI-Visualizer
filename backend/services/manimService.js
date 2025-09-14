const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ManimService {
  constructor() {
    this.isInitialized = false;
    this.tempDir = path.join(__dirname, '../temp/manim');
    this.outputDir = path.join(__dirname, '../public/manim');
  }

  async initialize() {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // Check if Manim is installed (optional)
      try {
        await this.checkManimInstallation();
        this.isInitialized = true;
        console.log('✅ Manim service initialized successfully');
      } catch (manimError) {
        console.warn('⚠️  Manim not available, falling back to canvas visualizations only');
        console.warn('   To enable Manim: Install Python 3.8+ and run: pip install manim');
        this.isInitialized = false;
        // Don't throw error, just disable Manim
      }
    } catch (error) {
      console.error('❌ Failed to initialize Manim service:', error.message);
      this.isInitialized = false;
      // Don't throw error, just disable Manim
    }
  }

  async checkManimInstallation() {
    return new Promise((resolve, reject) => {
      exec('manim --version', (error, stdout, stderr) => {
        if (error) {
          console.warn('⚠️  Manim not found. Installing...');
          this.installManim().then(resolve).catch(reject);
        } else {
          console.log('✅ Manim found:', stdout.trim());
          resolve();
        }
      });
    });
  }

  async installManim() {
    return new Promise((resolve, reject) => {
      console.log('📦 Installing Manim...');
      exec('pip install manim', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Failed to install Manim:', error.message);
          reject(error);
        } else {
          console.log('✅ Manim installed successfully');
          resolve();
        }
      });
    });
  }

  async generateAnimation(manimCode, concept, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️  Manim service not available, falling back to canvas visualization');
      return {
        success: false,
        error: 'Manim service not available',
        fallbackToCanvas: true
      };
    }

    // Default options
    const {
      duration = 15, // Default 15 seconds
      quality = 'h', // Default high quality
      fps = 30
    } = options;

    const sessionId = uuidv4();
    const scriptPath = path.join(this.tempDir, `${sessionId}.py`);
    const outputPath = path.join(this.outputDir, sessionId);

    try {
      // Write Manim script to file
      await fs.writeFile(scriptPath, manimCode, 'utf8');

      // Execute Manim to generate video
      const videoPath = await this.executeManim(scriptPath, outputPath, quality);

      // Return the public URL for the video
      return {
        success: true,
        videoUrl: `/manim/${sessionId}.mp4`,
        localPath: videoPath,
        sessionId
      };

    } catch (error) {
      console.error('❌ Manim animation generation failed:', error.message);
      
      // Clean up temporary files
      try {
        await fs.unlink(scriptPath);
      } catch (cleanupError) {
        console.warn('⚠️  Failed to clean up script file:', cleanupError.message);
      }

      return {
        success: false,
        error: error.message,
        fallbackToCanvas: true
      };
    }
  }

  async executeManim(scriptPath, outputPath, quality = 'h') {
    return new Promise((resolve, reject) => {
      // Use configurable quality settings
      const command = `manim -pq${quality} --output_file ${path.basename(outputPath)} ${scriptPath}`;
      
      console.log('🎬 Executing Manim:', command);
      
      exec(command, { 
        cwd: path.dirname(outputPath),
        timeout: 120000 // 2 minute timeout for longer videos
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Manim execution failed:', error.message);
          console.error('stderr:', stderr);
          reject(new Error(`Manim execution failed: ${error.message}`));
          return;
        }

        console.log('✅ Manim execution successful');
        console.log('stdout:', stdout);

        // Find the generated video file
        const videoPath = path.join(outputPath, '..', `${path.basename(outputPath)}.mp4`);
        
        // Check if video file exists
        fs.access(videoPath)
          .then(() => resolve(videoPath))
          .catch(() => {
            // Try alternative naming convention
            const altVideoPath = path.join(outputPath, '..', `${path.basename(outputPath)}_ManimCE_v0.18.0.mp4`);
            fs.access(altVideoPath)
              .then(() => resolve(altVideoPath))
              .catch(() => reject(new Error('Generated video file not found')));
          });
      });
    });
  }

  async cleanup(sessionId) {
    try {
      const scriptPath = path.join(this.tempDir, `${sessionId}.py`);
      const videoPath = path.join(this.outputDir, `${sessionId}.mp4`);
      
      await Promise.all([
        fs.unlink(scriptPath).catch(() => {}), // Ignore if file doesn't exist
        fs.unlink(videoPath).catch(() => {})  // Ignore if file doesn't exist
      ]);
      
      console.log(`🧹 Cleaned up Manim files for session: ${sessionId}`);
    } catch (error) {
      console.warn('⚠️  Failed to cleanup Manim files:', error.message);
    }
  }

  // Generate Manim code templates for common physics concepts
  getManimTemplate(concept) {
    const templates = {
      'newton_first_law': `
from manim import *

class NewtonFirstLaw(Scene):
    def construct(self):
        # Create a ball
        ball = Circle(radius=0.3, color=BLUE, fill_opacity=0.8)
        ball.move_to(LEFT * 4)
        
        # Create ground
        ground = Line(LEFT * 6, RIGHT * 6, color=GRAY)
        ground.shift(DOWN * 2)
        
        # Add labels
        title = Text("Newton's First Law: Inertia", font_size=36)
        title.to_edge(UP)
        
        # Animation
        self.play(Write(title))
        self.play(Create(ball), Create(ground))
        
        # Show object at rest
        rest_text = Text("Object at rest stays at rest", font_size=24)
        rest_text.next_to(ball, UP)
        self.play(Write(rest_text))
        self.wait(3)
        
        # Apply force and show motion
        force_arrow = Arrow(ball.get_center(), ball.get_center() + RIGHT * 2, color=RED)
        force_label = Text("Applied Force", font_size=20, color=RED)
        force_label.next_to(force_arrow, UP)
        
        self.play(Create(force_arrow), Write(force_label))
        self.wait(2)
        
        # Show acceleration phase
        self.play(ball.animate.shift(RIGHT * 4), run_time=3)
        
        # Show continued motion (no friction)
        motion_text = Text("Object in motion stays in motion", font_size=24)
        motion_text.next_to(ball, UP)
        self.play(Transform(rest_text, motion_text))
        self.wait(2)
        
        # Show continued motion without force
        self.play(ball.animate.shift(RIGHT * 3), run_time=4)
        
        # Add explanation
        explanation = Text("No external force = constant velocity", font_size=20, color=GREEN)
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(3)
`,

      'wave_motion': `
from manim import *

class WaveMotion(Scene):
    def construct(self):
        # Create wave
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-2, 2, 1],
            x_length=8,
            y_length=4,
            axis_config={"color": GRAY}
        )
        
        # Wave function
        def wave_func(x, t):
            return np.sin(2 * np.pi * (x - t))
        
        # Create wave
        wave = axes.plot(lambda x: wave_func(x, 0), color=BLUE)
        
        # Title
        title = Text("Wave Motion", font_size=36)
        title.to_edge(UP)
        
        # Animation
        self.play(Write(title))
        self.play(Create(axes))
        self.play(Create(wave))
        self.wait(2)
        
        # Add wave properties explanation
        properties = Text("Wave Properties: Wavelength, Frequency, Amplitude", font_size=20)
        properties.to_edge(DOWN)
        self.play(Write(properties))
        self.wait(2)
        
        # Animate wave propagation with more cycles
        for t in np.arange(0, 4, 0.15):
            new_wave = axes.plot(lambda x: wave_func(x, t), color=BLUE)
            self.play(Transform(wave, new_wave), run_time=0.1)
        
        # Show wave interference
        interference_text = Text("Wave Interference", font_size=24, color=YELLOW)
        interference_text.next_to(title, DOWN)
        self.play(Write(interference_text))
        self.wait(3)
        
        # Create second wave
        wave2 = axes.plot(lambda x: wave_func(x, 0), color=RED)
        self.play(Create(wave2))
        
        # Show interference pattern
        for t in np.arange(0, 2, 0.1):
            new_wave1 = axes.plot(lambda x: wave_func(x, t), color=BLUE)
            new_wave2 = axes.plot(lambda x: wave_func(x + 1, t), color=RED)
            self.play(Transform(wave, new_wave1), Transform(wave2, new_wave2), run_time=0.1)
        
        self.wait(3)
`,

      'orbital_motion': `
from manim import *

class OrbitalMotion(Scene):
    def construct(self):
        # Create sun
        sun = Circle(radius=0.5, color=YELLOW, fill_opacity=1)
        sun.move_to(ORIGIN)
        
        # Create planet
        planet = Circle(radius=0.2, color=BLUE, fill_opacity=1)
        planet.move_to(RIGHT * 3)
        
        # Create orbit path
        orbit = Circle(radius=3, color=WHITE, stroke_width=2)
        orbit.move_to(ORIGIN)
        
        # Title
        title = Text("Orbital Motion", font_size=36)
        title.to_edge(UP)
        
        # Animation
        self.play(Write(title))
        self.play(Create(sun), Create(orbit))
        self.play(Create(planet))
        self.wait(2)
        
        # Add gravitational force explanation
        force_text = Text("Gravitational Force", font_size=20, color=YELLOW)
        force_text.to_edge(DOWN)
        self.play(Write(force_text))
        self.wait(2)
        
        # Show gravitational force vector
        force_arrow = Arrow(planet.get_center(), sun.get_center(), color=YELLOW, stroke_width=3)
        self.play(Create(force_arrow))
        self.wait(2)
        
        # Animate multiple orbital cycles
        for i in range(3):
            self.play(
                Rotate(planet, angle=2*PI, about_point=ORIGIN),
                run_time=3,
                rate_func=linear
            )
            self.wait(1)
        
        # Show orbital velocity
        velocity_text = Text("Orbital Velocity", font_size=20, color=GREEN)
        velocity_text.next_to(force_text, UP)
        self.play(Write(velocity_text))
        self.wait(2)
        
        # Show velocity vector
        velocity_arrow = Arrow(planet.get_center(), planet.get_center() + UP * 0.5, color=GREEN, stroke_width=3)
        self.play(Create(velocity_arrow))
        self.wait(3)
`
    };

    return templates[concept] || templates['newton_first_law'];
  }
}

module.exports = new ManimService();
