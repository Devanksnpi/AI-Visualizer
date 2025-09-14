const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PhysicsService {
  constructor() {
    this.isInitialized = false;
    this.tempDir = path.join(__dirname, '../temp/physics');
    this.outputDir = path.join(__dirname, '../public/physics');
  }

  async initialize() {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });

      // Check if Python and physics libraries are available
      try {
        await this.checkPhysicsLibraries();
        this.isInitialized = true;
        console.log('✅ Physics service initialized successfully');
      } catch (physicsError) {
        console.warn('⚠️  Physics libraries not available, falling back to basic visualizations');
        console.warn('   To enable physics: Install Python 3.8+ and run: pip install pymunk matplotlib numpy scipy');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Physics service:', error.message);
      this.isInitialized = false;
    }
  }

  async checkPhysicsLibraries() {
    return new Promise((resolve, reject) => {
      exec('python -c "import pymunk, matplotlib, numpy, scipy; print(\'Physics libraries available\')"', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Physics libraries not found: ${error.message}`));
          return;
        }
        console.log(`Physics libraries: ${stdout.trim()}`);
        resolve(true);
      });
    });
  }

  async generatePhysicsSimulation(physicsCode, concept, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️  Physics service not available, falling back to basic visualization');
      return {
        success: false,
        error: 'Physics service not available',
        fallbackToCanvas: true
      };
    }

    const sessionId = uuidv4();
    const scriptPath = path.join(this.tempDir, `${sessionId}.py`);
    const outputPath = path.join(this.outputDir, sessionId);

    try {
      // Write physics simulation script to file
      await fs.writeFile(scriptPath, physicsCode, 'utf8');

      // Execute Python script to generate physics simulation
      const result = await this.executePhysicsSimulation(scriptPath, outputPath);

      // Return the public URL for the simulation
      return {
        success: true,
        simulationUrl: `/physics/${sessionId}.mp4`,
        dataUrl: `/physics/${sessionId}.json`,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('❌ Error generating physics simulation:', error.message);
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

  async executePhysicsSimulation(scriptPath, outputPath) {
    return new Promise((resolve, reject) => {
      const command = `python "${scriptPath}"`;

      console.log('🔬 Executing physics simulation:', command);

      exec(command, {
        timeout: 120000 // 2 minute timeout
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Physics simulation failed:', error.message);
          console.error('stderr:', stderr);
          reject(new Error(`Physics simulation failed: ${error.message}`));
          return;
        }
        console.log('✅ Physics simulation successful.');
        console.log('stdout:', stdout);
        resolve(outputPath);
      });
    });
  }

  // Generate physics simulation templates for common concepts
  getPhysicsTemplate(concept) {
    const templates = {
      'pendulum_motion': `
import pymunk
import pymunk.pygame_util
import pygame
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import sys
import os

# Physics simulation parameters
GRAVITY = 981  # pixels per second squared
DAMPING = 0.99  # air resistance
TIME_STEP = 1/60.0  # 60 FPS

class DoublePendulum:
    def __init__(self, length1=200, length2=150, mass1=10, mass2=8):
        self.space = pymunk.Space()
        self.space.gravity = (0, GRAVITY)
        
        # Create pendulum masses
        self.mass1 = mass1
        self.mass2 = mass2
        self.length1 = length1
        self.length2 = length2
        
        # Create bodies
        self.body1 = pymunk.Body(mass1, pymunk.moment_for_circle(mass1, 0, 10))
        self.body2 = pymunk.Body(mass2, pymunk.moment_for_circle(mass2, 0, 8))
        
        # Set initial positions
        self.body1.position = 400, 200
        self.body2.position = 400 + length1, 200 + length1
        
        # Create joints
        self.joint1 = pymunk.PinJoint(self.space.static_body, self.body1, (400, 100))
        self.joint2 = pymunk.PinJoint(self.body1, self.body2, (0, 0))
        
        # Add to space
        self.space.add(self.body1, self.body2, self.joint1, self.joint2)
        
        # Data collection
        self.time_data = []
        self.angle1_data = []
        self.angle2_data = []
        self.energy_data = []
        
    def step(self, dt):
        # Apply damping
        self.body1.angular_velocity *= DAMPING
        self.body2.angular_velocity *= DAMPING
        
        # Step simulation
        self.space.step(dt)
        
        # Calculate angles
        angle1 = np.arctan2(self.body1.position.y - 100, self.body1.position.x - 400)
        angle2 = np.arctan2(self.body2.position.y - self.body1.position.y, 
                           self.body2.position.x - self.body1.position.x)
        
        # Calculate energy
        kinetic = 0.5 * (self.mass1 * self.body1.velocity.length_squared + 
                        self.mass2 * self.body2.velocity.length_squared)
        potential = self.mass1 * GRAVITY * (300 - self.body1.position.y) + \
                   self.mass2 * GRAVITY * (300 - self.body2.position.y)
        total_energy = kinetic + potential
        
        # Store data
        self.time_data.append(len(self.time_data) * TIME_STEP)
        self.angle1_data.append(np.degrees(angle1))
        self.angle2_data.append(np.degrees(angle2))
        self.energy_data.append(total_energy)
        
        return angle1, angle2, total_energy

def run_simulation():
    # Create pendulum
    pendulum = DoublePendulum()
    
    # Run simulation for 10 seconds
    total_time = 10.0
    steps = int(total_time / TIME_STEP)
    
    print(f"Running {steps} simulation steps...")
    
    for i in range(steps):
        pendulum.step(TIME_STEP)
        if i % 60 == 0:  # Print progress every second
            print(f"Progress: {i/steps*100:.1f}%")
    
    # Create visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot 1: Pendulum trajectory
    ax1.plot(pendulum.angle1_data, pendulum.angle2_data, 'b-', alpha=0.7, linewidth=1)
    ax1.set_xlabel('Angle 1 (degrees)')
    ax1.set_ylabel('Angle 2 (degrees)')
    ax1.set_title('Double Pendulum Phase Space')
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Angle vs Time
    ax2.plot(pendulum.time_data, pendulum.angle1_data, 'r-', label='Pendulum 1', linewidth=2)
    ax2.plot(pendulum.time_data, pendulum.angle2_data, 'b-', label='Pendulum 2', linewidth=2)
    ax2.set_xlabel('Time (s)')
    ax2.set_ylabel('Angle (degrees)')
    ax2.set_title('Pendulum Angles vs Time')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Energy conservation
    ax3.plot(pendulum.time_data, pendulum.energy_data, 'g-', linewidth=2)
    ax3.set_xlabel('Time (s)')
    ax3.set_ylabel('Total Energy (J)')
    ax3.set_title('Energy Conservation')
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Chaotic behavior analysis
    if len(pendulum.angle1_data) > 1000:
        # Calculate Lyapunov exponent approximation
        divergence = []
        for i in range(100, len(pendulum.angle1_data)-100):
            local_div = abs(pendulum.angle1_data[i] - pendulum.angle1_data[i-100])
            divergence.append(local_div)
        
        ax4.plot(pendulum.time_data[100:len(divergence)+100], divergence, 'purple', linewidth=1)
        ax4.set_xlabel('Time (s)')
        ax4.set_ylabel('Angle Divergence')
        ax4.set_title('Chaotic Behavior (Divergence)')
        ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plots
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    # Save simulation data
    data_path = output_path.replace('.png', '.json')
    simulation_data = {
        'time': pendulum.time_data,
        'angle1': pendulum.angle1_data,
        'angle2': pendulum.angle2_data,
        'energy': pendulum.energy_data,
        'parameters': {
            'length1': pendulum.length1,
            'length2': pendulum.length2,
            'mass1': pendulum.mass1,
            'mass2': pendulum.mass2,
            'gravity': GRAVITY,
            'damping': DAMPING
        }
    }
    
    with open(data_path, 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    print(f"Simulation complete. Plots saved to: {output_path}")
    print(f"Data saved to: {data_path}")

if __name__ == "__main__":
    run_simulation()
`,

      'collision_dynamics': `
import pymunk
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import sys

# Physics parameters
GRAVITY = 981
RESTITUTION = 0.8  # Bounce factor
FRICTION = 0.7

class CollisionSimulation:
    def __init__(self):
        self.space = pymunk.Space()
        self.space.gravity = (0, GRAVITY)
        
        # Create ground
        ground = pymunk.Segment(self.space.static_body, (0, 500), (800, 500), 5)
        ground.friction = FRICTION
        ground.elasticity = RESTITUTION
        self.space.add(ground)
        
        # Create walls
        left_wall = pymunk.Segment(self.space.static_body, (0, 0), (0, 500), 5)
        right_wall = pymunk.Segment(self.space.static_body, (800, 0), (800, 500), 5)
        self.space.add(left_wall, right_wall)
        
        # Create balls with different properties
        self.balls = []
        self.trajectories = []
        
        # Ball 1: Heavy, slow
        ball1 = pymunk.Body(20, pymunk.moment_for_circle(20, 0, 15))
        ball1.position = 200, 100
        ball1.velocity = (100, 0)
        shape1 = pymunk.Circle(ball1, 15)
        shape1.friction = FRICTION
        shape1.elasticity = RESTITUTION
        self.space.add(ball1, shape1)
        self.balls.append(ball1)
        self.trajectories.append([])
        
        # Ball 2: Light, fast
        ball2 = pymunk.Body(5, pymunk.moment_for_circle(5, 0, 10))
        ball2.position = 600, 200
        ball2.velocity = (-150, 0)
        shape2 = pymunk.Circle(ball2, 10)
        shape2.friction = FRICTION
        shape2.elasticity = RESTITUTION
        self.space.add(ball2, shape2)
        self.balls.append(ball2)
        self.trajectories.append([])
        
        # Ball 3: Medium properties
        ball3 = pymunk.Body(10, pymunk.moment_for_circle(10, 0, 12))
        ball3.position = 400, 300
        ball3.velocity = (0, -200)
        shape3 = pymunk.Circle(ball3, 12)
        shape3.friction = FRICTION
        shape3.elasticity = RESTITUTION
        self.space.add(ball3, shape3)
        self.balls.append(ball3)
        self.trajectories.append([])
        
        self.time_data = []
        
    def step(self, dt):
        # Store current positions
        for i, ball in enumerate(self.balls):
            self.trajectories[i].append((ball.position.x, ball.position.y))
        
        # Step simulation
        self.space.step(dt)
        
        # Store time
        self.time_data.append(len(self.time_data) * dt)
        
        # Calculate kinetic energy
        total_ke = sum(0.5 * ball.mass * ball.velocity.length_squared for ball in self.balls)
        return total_ke

def run_simulation():
    sim = CollisionSimulation()
    
    # Run simulation
    dt = 1/60.0
    total_time = 8.0
    steps = int(total_time / dt)
    
    print(f"Running collision simulation for {total_time} seconds...")
    
    kinetic_energies = []
    for i in range(steps):
        ke = sim.step(dt)
        kinetic_energies.append(ke)
        
        if i % 60 == 0:
            print(f"Progress: {i/steps*100:.1f}%")
    
    # Create visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot 1: Ball trajectories
    colors = ['red', 'blue', 'green']
    for i, trajectory in enumerate(sim.trajectories):
        if trajectory:
            x_coords = [pos[0] for pos in trajectory]
            y_coords = [pos[1] for pos in trajectory]
            ax1.plot(x_coords, y_coords, color=colors[i], linewidth=2, alpha=0.7, 
                    label=f'Ball {i+1}')
    
    ax1.set_xlim(0, 800)
    ax1.set_ylim(0, 500)
    ax1.set_xlabel('X Position (pixels)')
    ax1.set_ylabel('Y Position (pixels)')
    ax1.set_title('Ball Trajectories')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.invert_yaxis()  # Invert Y axis to match physics coordinates
    
    # Plot 2: Kinetic energy over time
    ax2.plot(sim.time_data, kinetic_energies, 'purple', linewidth=2)
    ax2.set_xlabel('Time (s)')
    ax2.set_ylabel('Total Kinetic Energy (J)')
    ax2.set_title('Energy Conservation in Collisions')
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Velocity magnitudes
    for i, ball in enumerate(sim.balls):
        velocities = []
        for j in range(len(sim.time_data)):
            if j < len(sim.trajectories[i]) - 1:
                pos1 = sim.trajectories[i][j]
                pos2 = sim.trajectories[i][j+1]
                vel = np.sqrt((pos2[0] - pos1[0])**2 + (pos2[1] - pos1[1])**2) / dt
                velocities.append(vel)
            else:
                velocities.append(0)
        
        ax3.plot(sim.time_data[:len(velocities)], velocities, color=colors[i], 
                linewidth=2, label=f'Ball {i+1}')
    
    ax3.set_xlabel('Time (s)')
    ax3.set_ylabel('Velocity (pixels/s)')
    ax3.set_title('Ball Velocities Over Time')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Collision analysis
    collision_points = []
    for i in range(len(sim.trajectories[0]) - 1):
        for j in range(len(sim.balls)):
            for k in range(j+1, len(sim.balls)):
                if i < len(sim.trajectories[j]) and i < len(sim.trajectories[k]):
                    pos1 = sim.trajectories[j][i]
                    pos2 = sim.trajectories[k][i]
                    distance = np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
                    if distance < 30:  # Collision threshold
                        collision_points.append((sim.time_data[i], distance))
    
    if collision_points:
        collision_times, collision_distances = zip(*collision_points)
        ax4.scatter(collision_times, collision_distances, color='red', alpha=0.6, s=20)
        ax4.set_xlabel('Time (s)')
        ax4.set_ylabel('Distance at Collision (pixels)')
        ax4.set_title('Collision Events')
        ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plots
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    # Save simulation data
    data_path = output_path.replace('.png', '.json')
    simulation_data = {
        'time': sim.time_data,
        'trajectories': sim.trajectories,
        'kinetic_energy': kinetic_energies,
        'parameters': {
            'gravity': GRAVITY,
            'restitution': RESTITUTION,
            'friction': FRICTION
        }
    }
    
    with open(data_path, 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    print(f"Collision simulation complete. Plots saved to: {output_path}")
    print(f"Data saved to: {data_path}")

if __name__ == "__main__":
    run_simulation()
`,

      'fluid_dynamics': `
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import sys

class FluidSimulation:
    def __init__(self, width=100, height=80):
        self.width = width
        self.height = height
        
        # Fluid properties
        self.density = np.zeros((height, width))
        self.velocity_x = np.zeros((height, width))
        self.velocity_y = np.zeros((height, width))
        self.pressure = np.zeros((height, width))
        
        # Simulation parameters
        self.dt = 0.01
        self.dx = 1.0
        self.viscosity = 0.1
        self.diffusion = 0.1
        
        # Initialize fluid
        self.initialize_fluid()
        
        # Data collection
        self.time_data = []
        self.flow_data = []
        
    def initialize_fluid(self):
        # Create initial density distribution (smoke/ink)
        for i in range(20, 40):
            for j in range(30, 50):
                self.density[i, j] = 1.0
        
        # Create initial velocity field (wind)
        for i in range(self.height):
            for j in range(self.width):
                self.velocity_x[i, j] = 2.0 * np.sin(i * 0.1) * np.cos(j * 0.1)
                self.velocity_y[i, j] = 1.0 * np.cos(i * 0.1) * np.sin(j * 0.1)
    
    def diffuse(self, field, diffusion_rate):
        """Diffuse a field using finite difference method"""
        new_field = field.copy()
        for _ in range(20):  # Iterations for stability
            for i in range(1, self.height-1):
                for j in range(1, self.width-1):
                    new_field[i, j] = (field[i, j] + diffusion_rate * 
                                     (new_field[i-1, j] + new_field[i+1, j] + 
                                      new_field[i, j-1] + new_field[i, j+1])) / (1 + 4 * diffusion_rate)
        return new_field
    
    def advect(self, field, velocity_x, velocity_y):
        """Advect a field using the velocity field"""
        new_field = np.zeros_like(field)
        for i in range(1, self.height-1):
            for j in range(1, self.width-1):
                # Trace back in time
                x = j - velocity_x[i, j] * self.dt
                y = i - velocity_y[i, j] * self.dt
                
                # Clamp to grid bounds
                x = max(0.5, min(self.width-1.5, x))
                y = max(0.5, min(self.height-1.5, y))
                
                # Bilinear interpolation
                x0, y0 = int(x), int(y)
                x1, y1 = x0 + 1, y0 + 1
                s, t = x - x0, y - y0
                
                new_field[i, j] = ((1-s) * (1-t) * field[y0, x0] +
                                  s * (1-t) * field[y0, x1] +
                                  (1-s) * t * field[y1, x0] +
                                  s * t * field[y1, x1])
        return new_field
    
    def project(self):
        """Project velocity field to be divergence-free"""
        # Calculate divergence
        divergence = np.zeros((self.height, self.width))
        for i in range(1, self.height-1):
            for j in range(1, self.width-1):
                divergence[i, j] = -0.5 * ((self.velocity_x[i, j+1] - self.velocity_x[i, j-1]) +
                                          (self.velocity_y[i+1, j] - self.velocity_y[i-1, j]))
        
        # Solve Poisson equation for pressure
        pressure = np.zeros((self.height, self.width))
        for _ in range(20):
            for i in range(1, self.height-1):
                for j in range(1, self.width-1):
                    pressure[i, j] = (divergence[i, j] + 
                                    pressure[i-1, j] + pressure[i+1, j] +
                                    pressure[i, j-1] + pressure[i, j+1]) / 4
        
        # Subtract pressure gradient from velocity
        for i in range(1, self.height-1):
            for j in range(1, self.width-1):
                self.velocity_x[i, j] -= 0.5 * (pressure[i, j+1] - pressure[i, j-1])
                self.velocity_y[i, j] -= 0.5 * (pressure[i+1, j] - pressure[i-1, j])
    
    def step(self):
        """Perform one simulation step"""
        # Add source
        for i in range(25, 35):
            for j in range(40, 50):
                self.density[i, j] += 0.1
        
        # Diffuse velocity
        self.velocity_x = self.diffuse(self.velocity_x, self.viscosity * self.dt)
        self.velocity_y = self.diffuse(self.velocity_y, self.viscosity * self.dt)
        
        # Project velocity
        self.project()
        
        # Advect velocity
        self.velocity_x = self.advect(self.velocity_x, self.velocity_x, self.velocity_y)
        self.velocity_y = self.advect(self.velocity_y, self.velocity_x, self.velocity_y)
        
        # Project again
        self.project()
        
        # Diffuse and advect density
        self.density = self.diffuse(self.density, self.diffusion * self.dt)
        self.density = self.advect(self.density, self.velocity_x, self.velocity_y)
        
        # Calculate flow statistics
        total_density = np.sum(self.density)
        max_velocity = np.max(np.sqrt(self.velocity_x**2 + self.velocity_y**2))
        
        return total_density, max_velocity

def run_simulation():
    sim = FluidSimulation()
    
    # Run simulation
    total_time = 5.0
    steps = int(total_time / sim.dt)
    
    print(f"Running fluid simulation for {total_time} seconds...")
    
    density_data = []
    velocity_data = []
    
    for i in range(steps):
        total_density, max_velocity = sim.step()
        density_data.append(total_density)
        velocity_data.append(max_velocity)
        
        if i % 100 == 0:
            print(f"Progress: {i/steps*100:.1f}%")
    
    # Create visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot 1: Final density field
    im1 = ax1.imshow(sim.density, cmap='hot', origin='lower', aspect='equal')
    ax1.set_title('Final Density Distribution')
    ax1.set_xlabel('X Position')
    ax1.set_ylabel('Y Position')
    plt.colorbar(im1, ax=ax1, label='Density')
    
    # Plot 2: Velocity field
    x = np.arange(0, sim.width, 5)
    y = np.arange(0, sim.height, 5)
    X, Y = np.meshgrid(x, y)
    U = sim.velocity_x[::5, ::5]
    V = sim.velocity_y[::5, ::5]
    
    ax2.quiver(X, Y, U, V, alpha=0.7)
    ax2.set_title('Velocity Field')
    ax2.set_xlabel('X Position')
    ax2.set_ylabel('Y Position')
    ax2.set_aspect('equal')
    
    # Plot 3: Total density over time
    time_data = np.arange(len(density_data)) * sim.dt
    ax3.plot(time_data, density_data, 'b-', linewidth=2)
    ax3.set_xlabel('Time (s)')
    ax3.set_ylabel('Total Density')
    ax3.set_title('Density Conservation')
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Maximum velocity over time
    ax4.plot(time_data, velocity_data, 'r-', linewidth=2)
    ax4.set_xlabel('Time (s)')
    ax4.set_ylabel('Maximum Velocity')
    ax4.set_title('Flow Velocity Evolution')
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plots
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    # Save simulation data
    data_path = output_path.replace('.png', '.json')
    simulation_data = {
        'time': time_data.tolist(),
        'density': density_data,
        'velocity': velocity_data,
        'final_density_field': sim.density.tolist(),
        'final_velocity_x': sim.velocity_x.tolist(),
        'final_velocity_y': sim.velocity_y.tolist(),
        'parameters': {
            'viscosity': sim.viscosity,
            'diffusion': sim.diffusion,
            'dt': sim.dt
        }
    }
    
    with open(data_path, 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    print(f"Fluid simulation complete. Plots saved to: {output_path}")
    print(f"Data saved to: {data_path}")

if __name__ == "__main__":
    run_simulation()
`,

      'electromagnetic_fields': `
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Arrow
import json
import sys

class ElectromagneticSimulation:
    def __init__(self):
        self.width = 200
        self.height = 200
        
        # Create coordinate grids
        self.x = np.linspace(-10, 10, self.width)
        self.y = np.linspace(-10, 10, self.height)
        self.X, self.Y = np.meshgrid(self.x, self.y)
        
        # Charge properties
        self.charges = [
            {'q': 1.0, 'x': -3, 'y': 0, 'type': 'positive'},
            {'q': -1.0, 'x': 3, 'y': 0, 'type': 'negative'},
            {'q': 0.5, 'x': 0, 'y': 4, 'type': 'positive'}
        ]
        
        # Calculate electric field
        self.Ex, self.Ey = self.calculate_electric_field()
        self.potential = self.calculate_potential()
        
        # Calculate magnetic field (for moving charges)
        self.Bz = self.calculate_magnetic_field()
        
    def calculate_electric_field(self):
        """Calculate electric field from point charges"""
        Ex = np.zeros_like(self.X)
        Ey = np.zeros_like(self.Y)
        
        for charge in self.charges:
            # Distance from charge
            dx = self.X - charge['x']
            dy = self.Y - charge['y']
            r = np.sqrt(dx**2 + dy**2)
            
            # Avoid division by zero
            r = np.where(r < 0.1, 0.1, r)
            
            # Electric field components (k = 1 for simplicity)
            k = 1.0
            Ex += k * charge['q'] * dx / r**3
            Ey += k * charge['q'] * dy / r**3
        
        return Ex, Ey
    
    def calculate_potential(self):
        """Calculate electric potential"""
        potential = np.zeros_like(self.X)
        
        for charge in self.charges:
            dx = self.X - charge['x']
            dy = self.Y - charge['y']
            r = np.sqrt(dx**2 + dy**2)
            r = np.where(r < 0.1, 0.1, r)
            
            k = 1.0
            potential += k * charge['q'] / r
        
        return potential
    
    def calculate_magnetic_field(self):
        """Calculate magnetic field from moving charges"""
        Bz = np.zeros_like(self.X)
        
        # Assume charges are moving in x-direction
        for charge in self.charges:
            if charge['q'] > 0:  # Only positive charges moving
                dx = self.X - charge['x']
                dy = self.Y - charge['y']
                r = np.sqrt(dx**2 + dy**2)
                r = np.where(r < 0.1, 0.1, r)
                
                # Magnetic field from moving charge (simplified)
                v = 0.1  # velocity
                mu0 = 1.0  # permeability
                Bz += mu0 * charge['q'] * v * dy / (4 * np.pi * r**3)
        
        return Bz
    
    def calculate_field_lines(self, start_points, steps=1000, step_size=0.1):
        """Calculate electric field lines"""
        field_lines = []
        
        for start_x, start_y in start_points:
            line = [(start_x, start_y)]
            x, y = start_x, start_y
            
            for _ in range(steps):
                # Find electric field at current position
                idx_x = np.argmin(np.abs(self.x - x))
                idx_y = np.argmin(np.abs(self.y - y))
                
                if 0 <= idx_x < self.width and 0 <= idx_y < self.height:
                    Ex_val = self.Ex[idx_y, idx_x]
                    Ey_val = self.Ey[idx_y, idx_x]
                    
                    # Normalize field vector
                    field_magnitude = np.sqrt(Ex_val**2 + Ey_val**2)
                    if field_magnitude > 0:
                        Ex_val /= field_magnitude
                        Ey_val /= field_magnitude
                    
                    # Step along field line
                    x += Ex_val * step_size
                    y += Ey_val * step_size
                    
                    # Check bounds
                    if x < self.x[0] or x > self.x[-1] or y < self.y[0] or y > self.y[-1]:
                        break
                    
                    line.append((x, y))
                else:
                    break
            
            field_lines.append(line)
        
        return field_lines

def run_simulation():
    sim = ElectromagneticSimulation()
    
    # Create visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot 1: Electric field vectors
    skip = 5  # Skip some vectors for clarity
    ax1.quiver(sim.X[::skip, ::skip], sim.Y[::skip, ::skip], 
               sim.Ex[::skip, ::skip], sim.Ey[::skip, ::skip], 
               alpha=0.7, scale=20)
    
    # Add charges
    for charge in sim.charges:
        color = 'red' if charge['q'] > 0 else 'blue'
        size = abs(charge['q']) * 100
        circle = Circle((charge['x'], charge['y']), 0.3, 
                       color=color, alpha=0.8)
        ax1.add_patch(circle)
        ax1.text(charge['x'], charge['y'] + 0.5, 
                f"{'+' if charge['q'] > 0 else ''}{charge['q']}", 
                ha='center', va='bottom', fontweight='bold')
    
    ax1.set_xlim(-10, 10)
    ax1.set_ylim(-10, 10)
    ax1.set_xlabel('X Position')
    ax1.set_ylabel('Y Position')
    ax1.set_title('Electric Field Vectors')
    ax1.set_aspect('equal')
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Electric potential
    im2 = ax2.contourf(sim.X, sim.Y, sim.potential, levels=20, cmap='RdYlBu_r')
    ax2.contour(sim.X, sim.Y, sim.potential, levels=20, colors='black', alpha=0.3, linewidths=0.5)
    
    # Add charges
    for charge in sim.charges:
        color = 'red' if charge['q'] > 0 else 'blue'
        circle = Circle((charge['x'], charge['y']), 0.3, 
                       color=color, alpha=0.8)
        ax2.add_patch(circle)
    
    ax2.set_xlim(-10, 10)
    ax2.set_ylim(-10, 10)
    ax2.set_xlabel('X Position')
    ax2.set_ylabel('Y Position')
    ax2.set_title('Electric Potential')
    ax2.set_aspect('equal')
    plt.colorbar(im2, ax=ax2, label='Potential')
    
    # Plot 3: Field lines
    # Generate starting points for field lines
    start_points = []
    for charge in sim.charges:
        if charge['q'] > 0:  # Start field lines from positive charges
            for angle in np.linspace(0, 2*np.pi, 8, endpoint=False):
                start_x = charge['x'] + 0.5 * np.cos(angle)
                start_y = charge['y'] + 0.5 * np.sin(angle)
                start_points.append((start_x, start_y))
    
    field_lines = sim.calculate_field_lines(start_points)
    
    for line in field_lines:
        if len(line) > 1:
            x_coords = [point[0] for point in line]
            y_coords = [point[1] for point in line]
            ax3.plot(x_coords, y_coords, 'b-', alpha=0.7, linewidth=1)
    
    # Add charges
    for charge in sim.charges:
        color = 'red' if charge['q'] > 0 else 'blue'
        circle = Circle((charge['x'], charge['y']), 0.3, 
                       color=color, alpha=0.8)
        ax3.add_patch(circle)
    
    ax3.set_xlim(-10, 10)
    ax3.set_ylim(-10, 10)
    ax3.set_xlabel('X Position')
    ax3.set_ylabel('Y Position')
    ax3.set_title('Electric Field Lines')
    ax3.set_aspect('equal')
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Magnetic field
    im4 = ax4.contourf(sim.X, sim.Y, sim.Bz, levels=20, cmap='RdBu_r')
    ax4.contour(sim.X, sim.Y, sim.Bz, levels=20, colors='black', alpha=0.3, linewidths=0.5)
    
    # Add charges
    for charge in sim.charges:
        color = 'red' if charge['q'] > 0 else 'blue'
        circle = Circle((charge['x'], charge['y']), 0.3, 
                       color=color, alpha=0.8)
        ax4.add_patch(circle)
    
    ax4.set_xlim(-10, 10)
    ax4.set_ylim(-10, 10)
    ax4.set_xlabel('X Position')
    ax4.set_ylabel('Y Position')
    ax4.set_title('Magnetic Field (from moving charges)')
    ax4.set_aspect('equal')
    plt.colorbar(im4, ax=ax4, label='Magnetic Field')
    
    plt.tight_layout()
    
    # Save plots
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'output.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    
    # Save simulation data
    data_path = output_path.replace('.png', '.json')
    simulation_data = {
        'charges': sim.charges,
        'electric_field': {
            'x': sim.Ex.tolist(),
            'y': sim.Ey.tolist()
        },
        'potential': sim.potential.tolist(),
        'magnetic_field': sim.Bz.tolist(),
        'coordinates': {
            'x': sim.x.tolist(),
            'y': sim.y.tolist()
        }
    }
    
    with open(data_path, 'w') as f:
        json.dump(simulation_data, f, indent=2)
    
    print(f"Electromagnetic simulation complete. Plots saved to: {output_path}")
    print(f"Data saved to: {data_path}")

if __name__ == "__main__":
    run_simulation()
`
    };

    return templates[concept] || templates['pendulum_motion'];
  }
}

module.exports = new PhysicsService();
