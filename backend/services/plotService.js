const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PlotService {
  constructor() {
    this.isInitialized = false;
    this.tempDir = path.join(__dirname, '../temp/plots');
    this.outputDir = path.join(__dirname, '../public/plots');
  }

  async initialize() {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });

      // Check if Python and matplotlib are available
      try {
        await this.checkPythonInstallation();
        this.isInitialized = true;
        console.log('✅ Plot service initialized successfully');
      } catch (pythonError) {
        console.warn('⚠️  Python/Matplotlib not available, falling back to canvas visualizations only');
        console.warn('   To enable plots: Install Python 3.8+ and run: pip install matplotlib plotly');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Plot service:', error.message);
      this.isInitialized = false;
    }
  }

  async checkPythonInstallation() {
    return new Promise((resolve, reject) => {
      exec('python --version', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Python not found: ${error.message}`));
          return;
        }
        console.log(`Python version: ${stdout.trim()}`);
        resolve(true);
      });
    });
  }

  async generatePlot(plotCode, concept, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️  Plot service not available, falling back to canvas visualization');
      return {
        success: false,
        error: 'Plot service not available',
        fallbackToCanvas: true
      };
    }

    const sessionId = uuidv4();
    const scriptPath = path.join(this.tempDir, `${sessionId}.py`);
    const outputPath = path.join(this.outputDir, sessionId);

    try {
      // Write plot script to file
      await fs.writeFile(scriptPath, plotCode, 'utf8');

      // Execute Python script to generate plot
      const imagePath = await this.executePlot(scriptPath, outputPath);

      // Return the public URL for the image
      return {
        success: true,
        imageUrl: `/plots/${sessionId}.png`,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('❌ Error generating plot:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackToCanvas: true
      };
    } finally {
      // Clean up script file
      try {
        await fs.unlink(scriptPath);
      } catch (cleanupError) {
        console.warn('⚠️  Failed to clean up script file:', cleanupError.message);
      }
    }
  }

  async executePlot(scriptPath, outputPath) {
    return new Promise((resolve, reject) => {
      const command = `python "${scriptPath}"`;

      console.log('📊 Executing plot script:', command);

      exec(command, {
        timeout: 60000 // 1 minute timeout
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Plot execution failed:', error.message);
          console.error('stderr:', stderr);
          reject(new Error(`Plot execution failed: ${error.message}`));
          return;
        }
        console.log('✅ Plot execution successful.');
        console.log('stdout:', stdout);
        resolve(outputPath + '.png'); // Python script should output PNG
      });
    });
  }

  // Generate plot templates for common scientific concepts
  getPlotTemplate(concept) {
    const templates = {
      'function_graph': `
import matplotlib.pyplot as plt
import numpy as np
import sys
import os

# Set up the plot
plt.style.use('seaborn-v0_8')
fig, ax = plt.subplots(figsize=(12, 8))

# Generate data
x = np.linspace(-10, 10, 1000)
y = np.sin(x) * np.exp(-x**2/20)

# Create the plot
ax.plot(x, y, 'b-', linewidth=2, label='sin(x) * exp(-x²/20)')
ax.set_xlabel('X', fontsize=14)
ax.set_ylabel('Y', fontsize=14)
ax.set_title('Mathematical Function Visualization', fontsize=16, fontweight='bold')
ax.grid(True, alpha=0.3)
ax.legend(fontsize=12)

# Add annotations
ax.annotate('Peak', xy=(0, 1), xytext=(2, 1.5),
            arrowprops=dict(arrowstyle='->', color='red', lw=2),
            fontsize=12, color='red')

# Save the plot
output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Plot saved to: {output_path}")
`,

      'data_visualization': `
import matplotlib.pyplot as plt
import numpy as np
import sys

# Set up the plot
plt.style.use('seaborn-v0_8')
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Generate sample data
np.random.seed(42)
x = np.random.randn(1000)
y = 2 * x + np.random.randn(1000) * 0.5

# Scatter plot
ax1.scatter(x, y, alpha=0.6, c='blue', s=20)
ax1.set_xlabel('X Values', fontsize=12)
ax1.set_ylabel('Y Values', fontsize=12)
ax1.set_title('Scatter Plot: X vs Y', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)

# Add trend line
z = np.polyfit(x, y, 1)
p = np.poly1d(z)
ax1.plot(x, p(x), "r--", alpha=0.8, linewidth=2, label=f'Trend: y={z[0]:.2f}x+{z[1]:.2f}')
ax1.legend()

# Histogram
ax2.hist(x, bins=30, alpha=0.7, color='green', edgecolor='black')
ax2.set_xlabel('X Values', fontsize=12)
ax2.set_ylabel('Frequency', fontsize=12)
ax2.set_title('Distribution of X Values', fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3)

# Add statistics
mean_x = np.mean(x)
std_x = np.std(x)
ax2.axvline(mean_x, color='red', linestyle='--', linewidth=2, label=f'Mean: {mean_x:.2f}')
ax2.axvline(mean_x + std_x, color='orange', linestyle='--', linewidth=2, label=f'+1σ: {mean_x + std_x:.2f}')
ax2.axvline(mean_x - std_x, color='orange', linestyle='--', linewidth=2, label=f'-1σ: {mean_x - std_x:.2f}')
ax2.legend()

plt.tight_layout()

# Save the plot
output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Plot saved to: {output_path}")
`,

      'physics_simulation': `
import matplotlib.pyplot as plt
import numpy as np
import sys
from matplotlib.animation import FuncAnimation

# Set up the plot
plt.style.use('seaborn-v0_8')
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

# Physics simulation parameters
g = 9.81  # gravity
v0 = 20   # initial velocity
angle = 45  # launch angle in degrees
angle_rad = np.radians(angle)

# Calculate trajectory
t_max = 2 * v0 * np.sin(angle_rad) / g
t = np.linspace(0, t_max, 100)
x = v0 * np.cos(angle_rad) * t
y = v0 * np.sin(angle_rad) * t - 0.5 * g * t**2

# Plot trajectory
ax1.plot(x, y, 'b-', linewidth=3, label='Projectile Path')
ax1.scatter(x[0], y[0], color='green', s=100, label='Start', zorder=5)
ax1.scatter(x[-1], y[-1], color='red', s=100, label='Landing', zorder=5)

# Add velocity vectors at key points
for i in [0, len(x)//4, len(x)//2, 3*len(x)//4]:
    vx = v0 * np.cos(angle_rad)
    vy = v0 * np.sin(angle_rad) - g * t[i]
    ax1.arrow(x[i], y[i], vx*0.5, vy*0.5, head_width=0.5, head_length=0.3, fc='red', ec='red', alpha=0.7)

ax1.set_xlabel('Horizontal Distance (m)', fontsize=12)
ax1.set_ylabel('Height (m)', fontsize=12)
ax1.set_title('Projectile Motion Simulation', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)
ax1.legend()
ax1.set_aspect('equal')

# Plot velocity components over time
ax2.plot(t, v0 * np.cos(angle_rad) * np.ones_like(t), 'b-', linewidth=2, label='Vx (constant)')
ax2.plot(t, v0 * np.sin(angle_rad) - g * t, 'r-', linewidth=2, label='Vy (changing)')
ax2.set_xlabel('Time (s)', fontsize=12)
ax2.set_ylabel('Velocity (m/s)', fontsize=12)
ax2.set_title('Velocity Components vs Time', fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3)
ax2.legend()

# Add annotations
max_height = np.max(y)
max_range = np.max(x)
ax1.annotate(f'Max Height: {max_height:.1f}m', xy=(x[np.argmax(y)], max_height), 
             xytext=(x[np.argmax(y)]+2, max_height+1),
             arrowprops=dict(arrowstyle='->', color='blue'),
             fontsize=10, color='blue')
ax1.annotate(f'Range: {max_range:.1f}m', xy=(max_range, 0), 
             xytext=(max_range-3, 2),
             arrowprops=dict(arrowstyle='->', color='green'),
             fontsize=10, color='green')

plt.tight_layout()

# Save the plot
output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Plot saved to: {output_path}")
`,

      'chemical_reaction': `
import matplotlib.pyplot as plt
import numpy as np
import sys

# Set up the plot
plt.style.use('seaborn-v0_8')
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Chemical reaction: A + B -> C
# Rate law: rate = k[A][B]
k = 0.1  # rate constant
A0 = 1.0  # initial concentration of A
B0 = 1.0  # initial concentration of B
C0 = 0.0  # initial concentration of C

# Time array
t = np.linspace(0, 50, 1000)

# Solve the differential equations numerically
dt = t[1] - t[0]
A = np.zeros_like(t)
B = np.zeros_like(t)
C = np.zeros_like(t)

A[0] = A0
B[0] = B0
C[0] = C0

for i in range(1, len(t)):
    rate = k * A[i-1] * B[i-1]
    A[i] = A[i-1] - rate * dt
    B[i] = B[i-1] - rate * dt
    C[i] = C[i-1] + rate * dt

# Plot concentration vs time
ax1.plot(t, A, 'b-', linewidth=2, label='[A] (Reactant)')
ax1.plot(t, B, 'g-', linewidth=2, label='[B] (Reactant)')
ax1.plot(t, C, 'r-', linewidth=2, label='[C] (Product)')
ax1.set_xlabel('Time (s)', fontsize=12)
ax1.set_ylabel('Concentration (M)', fontsize=12)
ax1.set_title('Chemical Reaction Kinetics: A + B → C', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)
ax1.legend()

# Plot reaction rate vs time
rate = k * A * B
ax2.plot(t, rate, 'purple', linewidth=2, label='Reaction Rate')
ax2.set_xlabel('Time (s)', fontsize=12)
ax2.set_ylabel('Rate (M/s)', fontsize=12)
ax2.set_title('Reaction Rate vs Time', fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3)
ax2.legend()

# Add equilibrium line
equilibrium_A = A[-1]
equilibrium_B = B[-1]
equilibrium_C = C[-1]
ax1.axhline(y=equilibrium_A, color='blue', linestyle='--', alpha=0.5, label=f'Equilibrium [A] = {equilibrium_A:.3f}M')
ax1.axhline(y=equilibrium_B, color='green', linestyle='--', alpha=0.5, label=f'Equilibrium [B] = {equilibrium_B:.3f}M')
ax1.axhline(y=equilibrium_C, color='red', linestyle='--', alpha=0.5, label=f'Equilibrium [C] = {equilibrium_C:.3f}M')

plt.tight_layout()

# Save the plot
output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Plot saved to: {output_path}")
`
    };

    return templates[concept] || templates['function_graph'];
  }
}

module.exports = new PlotService();
