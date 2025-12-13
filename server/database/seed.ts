import type { Database } from '@cloudflare/d1'

/**
 * Seed the database with test projects and sample submissions
 * This is idempotent - can be run multiple times safely
 * Auto-generated from HTML files in public/projects
 */
export async function seedDatabase(db: Database) {
  // Sample HTML submissions for each project
  const sampleSubmissions: Record<string, Array<{ agentName: string; label: string; htmlContent: string }>> = {
    'conways-game-of-life': [
      {
        agentName: 'reference',
        label: 'Conway\'s Game of Life - Reference',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conway's Game of Life</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a2e;
            font-family: Arial, sans-serif;
        }
        canvas {
            border: 2px solid #16213e;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const GRID_SIZE = 80;
        const CELL_SIZE = 8;
        canvas.width = GRID_SIZE * CELL_SIZE;
        canvas.height = GRID_SIZE * CELL_SIZE;
        
        let grid = createGrid();
        let nextGrid = createGrid();
        
        function createGrid() {
            return Array(GRID_SIZE).fill(null).map(() => 
                Array(GRID_SIZE).fill(null).map(() => Math.random() > 0.7)
            );
        }
        
        function countNeighbors(x, y) {
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const newX = (x + i + GRID_SIZE) % GRID_SIZE;
                    const newY = (y + j + GRID_SIZE) % GRID_SIZE;
                    if (grid[newX][newY]) count++;
                }
            }
            return count;
        }
        
        function updateGrid() {
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    const neighbors = countNeighbors(x, y);
                    const cell = grid[x][y];
                    
                    if (cell && (neighbors === 2 || neighbors === 3)) {
                        nextGrid[x][y] = true;
                    } else if (!cell && neighbors === 3) {
                        nextGrid[x][y] = true;
                    } else {
                        nextGrid[x][y] = false;
                    }
                }
            }
            [grid, nextGrid] = [nextGrid, grid];
        }
        
        function draw() {
            ctx.fillStyle = '#0f3460';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    if (grid[x][y]) {
                        ctx.fillStyle = '#00ff88';
                        ctx.fillRect(
                            x * CELL_SIZE + 1,
                            y * CELL_SIZE + 1,
                            CELL_SIZE - 2,
                            CELL_SIZE - 2
                        );
                    }
                }
            }
        }
        
        function gameLoop() {
            updateGrid();
            draw();
        }
        
        draw();
        setInterval(gameLoop, 100);
    </script>
</body>
</html>

`
      },
    ],
    'particle-gravity': [
      {
        agentName: 'reference',
        label: 'Particle Gravity Simulation - Reference',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Particle Gravity Simulation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    canvas { 
      background: #0a0e27; 
      border: 4px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    const config = {
      particleCount: 25,
      gravity: 0.3,
      dampening: 0.85,
      radius: 8
    };
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height * 0.3);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = Math.random() * 2;
        this.radius = config.radius;
        this.color = this.randomColor();
      }
      
      randomColor() {
        const hue = Math.random() * 360;
        return \`hsl(\${hue}, 80%, 60%)\`;
      }
      
      update() {
        // Apply gravity
        this.vy += config.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off bottom
        if (this.y + this.radius > canvas.height) {
          this.y = canvas.height - this.radius;
          this.vy *= -config.dampening;
          this.vx *= config.dampening;
        }
        
        // Bounce off sides
        if (this.x - this.radius < 0) {
          this.x = this.radius;
          this.vx *= -config.dampening;
        } else if (this.x + this.radius > canvas.width) {
          this.x = canvas.width - this.radius;
          this.vx *= -config.dampening;
        }
        
        // Very slow particles settle
        if (Math.abs(this.vy) < 0.5 && this.y > canvas.height - this.radius - 2) {
          this.vy = 0;
          this.vx *= 0.95;
        }
      }
      
      draw() {
        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
    
    function animate() {
      // Trail effect
      ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
  </script>
</body>
</html>
`
      },
    ],
    'pathfinding-visualizer': [
      {
        agentName: 'reference',
        label: 'Pathfinding Algorithm Visualizer - Reference',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pathfinding Visualizer</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a2e;
            font-family: Arial, sans-serif;
        }
        canvas {
            border: 2px solid #16213e;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <canvas id="pathCanvas"></canvas>
    <script>
        const canvas = document.getElementById('pathCanvas');
        const ctx = canvas.getContext('2d');
        
        const GRID_SIZE = 40;
        const CELL_SIZE = 15;
        canvas.width = GRID_SIZE * CELL_SIZE;
        canvas.height = GRID_SIZE * CELL_SIZE;
        
        const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        
        // 0 = empty, 1 = wall, 2 = start, 3 = end, 4 = explored, 5 = path
        const start = { x: 2, y: 2 };
        const end = { x: GRID_SIZE - 3, y: GRID_SIZE - 3 };
        
        grid[start.x][start.y] = 2;
        grid[end.x][end.y] = 3;
        
        // Generate random walls
        for (let i = 0; i < GRID_SIZE * GRID_SIZE * 0.25; i++) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            if (grid[x][y] === 0) {
                grid[x][y] = 1;
            }
        }
        
        function heuristic(a, b) {
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        }
        
        function getNeighbors(node) {
            const neighbors = [];
            const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dx, dy] of dirs) {
                const x = node.x + dx;
                const y = node.y + dy;
                if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && grid[x][y] !== 1) {
                    neighbors.push({ x, y });
                }
            }
            return neighbors;
        }
        
        async function aStar() {
            const openSet = [start];
            const cameFrom = new Map();
            const gScore = new Map();
            const fScore = new Map();
            
            gScore.set(\`\${start.x},\${start.y}\`, 0);
            fScore.set(\`\${start.x},\${start.y}\`, heuristic(start, end));
            
            while (openSet.length > 0) {
                openSet.sort((a, b) => {
                    const aScore = fScore.get(\`\${a.x},\${a.y}\`) || Infinity;
                    const bScore = fScore.get(\`\${b.x},\${b.y}\`) || Infinity;
                    return aScore - bScore;
                });
                
                const current = openSet.shift();
                
                if (current.x === end.x && current.y === end.y) {
                    // Reconstruct path
                    const path = [];
                    let temp = current;
                    while (cameFrom.has(\`\${temp.x},\${temp.y}\`)) {
                        path.unshift(temp);
                        temp = cameFrom.get(\`\${temp.x},\${temp.y}\`);
                    }
                    
                    for (const node of path) {
                        if (grid[node.x][node.y] === 4) {
                            grid[node.x][node.y] = 5;
                        }
                    }
                    draw();
                    return;
                }
                
                if (grid[current.x][current.y] === 0) {
                    grid[current.x][current.y] = 4;
                }
                
                draw();
                await new Promise(resolve => setTimeout(resolve, 20));
                
                for (const neighbor of getNeighbors(current)) {
                    const tentativeGScore = (gScore.get(\`\${current.x},\${current.y}\`) || Infinity) + 1;
                    const neighborKey = \`\${neighbor.x},\${neighbor.y}\`;
                    
                    if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                        cameFrom.set(neighborKey, current);
                        gScore.set(neighborKey, tentativeGScore);
                        fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
                        
                        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                            openSet.push(neighbor);
                        }
                    }
                }
            }
        }
        
        function draw() {
            const colors = {
                0: '#0f3460',  // empty
                1: '#16213e',  // wall
                2: '#00ff00',  // start
                3: '#ff0000',  // end
                4: '#4a90e2',  // explored
                5: '#ffff00'   // path
            };
            
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    ctx.fillStyle = colors[grid[x][y]];
                    ctx.fillRect(
                        x * CELL_SIZE + 1,
                        y * CELL_SIZE + 1,
                        CELL_SIZE - 2,
                        CELL_SIZE - 2
                    );
                }
            }
        }
        
        draw();
        setTimeout(() => aStar(), 500);
    </script>
</body>
</html>

`
      },
    ],
    'traffic-simulation': [
      {
        agentName: 'reference',
        label: 'Traffic Simulation - Reference',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Traffic Simulation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #1a1a1a; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      font-family: monospace;
    }
    canvas { 
      background: #2d5016; 
      border: 3px solid #333;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas setup
    canvas.width = 800;
    canvas.height = 600;
    
    // Configuration
    const config = {
      carCount: 8,
      greenDuration: 3000,  // 3 seconds
      redDuration: 4000,    // 4 seconds
      carSpeed: 2,
      carWidth: 40,
      carHeight: 60,
      laneWidth: 100
    };
    
    // Traffic light
    const trafficLight = {
      x: canvas.width / 2,
      y: 150,
      state: 'green', // 'green' or 'red'
      lastChange: Date.now(),
      
      update() {
        const now = Date.now();
        const elapsed = now - this.lastChange;
        
        if (this.state === 'green' && elapsed > config.greenDuration) {
          this.state = 'red';
          this.lastChange = now;
        } else if (this.state === 'red' && elapsed > config.redDuration) {
          this.state = 'green';
          this.lastChange = now;
        }
      },
      
      draw() {
        // Traffic light pole
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 5, this.y, 10, 80);
        
        // Traffic light box
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - 20, this.y - 60, 40, 60);
        
        // Red light
        ctx.fillStyle = this.state === 'red' ? '#ff0000' : '#440000';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 40, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Green light
        ctx.fillStyle = this.state === 'green' ? '#00ff00' : '#004400';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 20, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Car class
    class Car {
      constructor(id) {
        this.id = id;
        this.x = canvas.width / 2 - config.carWidth / 2;
        this.y = canvas.height + id * 120; // Start below canvas, staggered
        this.speed = config.carSpeed;
        this.color = this.randomColor();
      }
      
      randomColor() {
        const colors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff', '#ffffff', '#ff8844'];
        return colors[this.id % colors.length];
      }
      
      update(cars) {
        // Check if we need to stop for red light
        const stopLine = trafficLight.y + 80;
        const carFront = this.y;
        
        if (trafficLight.state === 'red' && carFront > stopLine - 50 && carFront < stopLine + 10) {
          // Stop at the light
          return;
        }
        
        // Check for car ahead
        let canMove = true;
        for (let car of cars) {
          if (car.id !== this.id && car.y < this.y && this.y - car.y < config.carHeight + 20) {
            canMove = false;
            break;
          }
        }
        
        if (canMove) {
          this.y -= this.speed;
        }
        
        // Reset position when off screen
        if (this.y < -config.carHeight) {
          this.y = canvas.height + Math.random() * 200;
        }
      }
      
      draw() {
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, config.carWidth, config.carHeight);
        
        // Car outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, config.carWidth, config.carHeight);
        
        // Windshield
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.fillRect(this.x + 5, this.y + 5, config.carWidth - 10, 20);
        
        // Wheels
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 3, this.y + 10, 6, 12);
        ctx.fillRect(this.x + config.carWidth - 3, this.y + 10, 6, 12);
        ctx.fillRect(this.x - 3, this.y + config.carHeight - 22, 6, 12);
        ctx.fillRect(this.x + config.carWidth - 3, this.y + config.carHeight - 22, 6, 12);
      }
    }
    
    // Create cars
    const cars = [];
    for (let i = 0; i < config.carCount; i++) {
      cars.push(new Car(i));
    }
    
    // Animation loop
    function animate() {
      // Clear canvas
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw road
      ctx.fillStyle = '#444';
      const roadX = canvas.width / 2 - config.laneWidth / 2;
      ctx.fillRect(roadX, 0, config.laneWidth, canvas.height);
      
      // Draw road markings
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw stop line
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(roadX, trafficLight.y + 80);
      ctx.lineTo(roadX + config.laneWidth, trafficLight.y + 80);
      ctx.stroke();
      
      // Update and draw traffic light
      trafficLight.update();
      trafficLight.draw();
      
      // Update and draw cars
      cars.forEach(car => {
        car.update(cars);
        car.draw();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
  </script>
</body>
</html>
`
      },
    ],
    'wave-patterns': [
      {
        agentName: 'reference',
        label: 'Wave Pattern Generator - Reference',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wave Pattern Generator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #000;
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh;
      overflow: hidden;
    }
    canvas { 
      border: 2px solid #222;
      box-shadow: 0 0 40px rgba(0, 200, 255, 0.3);
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    const config = {
      waveSpeed: 0.05,
      waveLength: 40,
      amplitude: 20,
      sources: [
        { x: 200, y: 300 },
        { x: 600, y: 300 },
        { x: 400, y: 150 },
        { x: 400, y: 450 }
      ]
    };
    
    let time = 0;
    
    function getWaveValue(x, y, time) {
      let sum = 0;
      
      for (let source of config.sources) {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate wave value
        const wave = Math.sin(distance / config.waveLength - time);
        sum += wave;
      }
      
      return sum / config.sources.length;
    }
    
    function drawWaves() {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const value = getWaveValue(x, y, time);
          const index = (y * canvas.width + x) * 4;
          
          // Map wave value to color
          const normalized = (value + 1) / 2; // 0 to 1
          
          if (normalized > 0.5) {
            // Positive interference - cyan to white
            const intensity = (normalized - 0.5) * 2;
            data[index] = 100 + intensity * 155;     // R
            data[index + 1] = 200 + intensity * 55;  // G
            data[index + 2] = 255;                   // B
          } else {
            // Negative interference - black to cyan
            const intensity = normalized * 2;
            data[index] = intensity * 100;           // R
            data[index + 1] = intensity * 200;       // G
            data[index + 2] = intensity * 255;       // B
          }
          
          data[index + 3] = 255; // Alpha
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Draw source points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      config.sources.forEach(source => {
        ctx.beginPath();
        ctx.arc(source.x, source.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Pulsing ring
        const pulseRadius = ((time * 10) % 30) + 5;
        ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - pulseRadius / 35})\`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(source.x, source.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    
    function animate() {
      time += config.waveSpeed;
      drawWaves();
      requestAnimationFrame(animate);
    }
    
    animate();
  </script>
</body>
</html>
`
      },
    ],
  }

  try {
    // Get all existing projects
    const projectsResult = await db.prepare('SELECT id FROM projects').all()
    const existingProjectIds = new Set(
      (projectsResult.results as any[]).map(p => p.id)
    )

    // Get all existing submissions to avoid duplicates
    const submissionsResult = await db.prepare('SELECT project_id, agent_name FROM submissions').all()
    const existingSubmissions = new Set(
      (submissionsResult.results as any[]).map(s => `${s.project_id}:${s.agent_name}`)
    )

    let projectsCreated = 0
    let submissionsCreated = 0

    // Seed submissions for each project
    for (const [projectId, submissions] of Object.entries(sampleSubmissions)) {
      if (!existingProjectIds.has(projectId)) {
        console.log(`[seed] Project ${projectId} not found, skipping submissions`)
        continue
      }

      for (const submission of submissions) {
        const submissionKey = `${projectId}:${submission.agentName}`
        if (existingSubmissions.has(submissionKey)) {
          console.log(`[seed] Submission ${submissionKey} already exists, skipping`)
          continue
        }

        const id = crypto.randomUUID()
        const submittedAt = Math.floor(Date.now() / 1000)
        const filePath = `${submission.agentName}/index.html`

        // Generate a simple placeholder thumbnail (will be replaced by actual generation)
        const thumbnail = generatePlaceholderThumbnail(submission.label)

        try {
          await db.prepare(
            `INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)`
          )
            .bind(id, projectId, submission.agentName, submission.label, filePath, submission.htmlContent, thumbnail, submittedAt)
            .run()

          submissionsCreated++
          console.log(`[seed] Created submission: ${submission.label} for ${projectId}`)
        } catch (error) {
          console.error(`[seed] Error creating submission ${submissionKey}:`, error)
        }
      }
    }

    return {
      success: true,
      projectsCreated,
      submissionsCreated
    }
  } catch (error) {
    console.error('[seed] Error seeding database:', error)
    throw error
  }
}

/**
 * Generate a simple placeholder thumbnail
 */
function generatePlaceholderThumbnail(label: string): string {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grad)"/>
      <text x="400" y="300" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${escapeXml(label)}
      </text>
      <text x="400" y="350" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="middle">
        Preview
      </text>
    </svg>
  `
  
  // Use btoa for base64 encoding (works in both Node and browser environments)
  const base64 = typeof Buffer !== 'undefined' 
    ? Buffer.from(svg).toString('base64')
    : btoa(unescape(encodeURIComponent(svg)))
  return `data:image/svg+xml;base64,${base64}`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
