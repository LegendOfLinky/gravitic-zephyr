const GameState = {
    showSphereOfInfluence: false,      // Toggle for showing gravitational influence zones
    ORBIT_RADIUS: 1600,                // Standard orbital distance
    timeWarp: 1.0,                     // Time acceleration factor

     // Initialize game components and setup
     init() {
        // Setup canvas and get drawing context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Initialize core game systems
        this.inputManager = new InputManager();
        this.camera = new Camera();
        this.orbitPredictor = new OrbitPredictor();

        this.touchControls = new TouchControls();
        
        // Handle window resizing to maintain fullscreen
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
        });
        
        this.setupEventListeners();
        this.initializeGame();
    },

    // Setup input handling
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            // 'T' toggles sphere of influence display
            if (e.key === 't' || e.key === 'T') {
                this.showSphereOfInfluence = !this.showSphereOfInfluence;
            }
            // '[' decreases time warp
            if (e.key === '[' && this.timeWarp > 0.25) {
                this.timeWarp *= 0.5;
                UIManager.updateTimeWarp(this.timeWarp);
            }
            // ']' increases time warp
            if (e.key === ']' && this.timeWarp < 16.0) {
                this.timeWarp *= 2.0;
                UIManager.updateTimeWarp(this.timeWarp);
            }
        });

        // Mouse wheel controls camera zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.targetZoom *= e.deltaY > 0 ? 0.9 : 1.1;
            // Clamp zoom between 0.1 and 5
            this.camera.targetZoom = Math.max(0.1, Math.min(this.camera.targetZoom, 5));
        });

        // Reset button handler
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    },

    // Create and setup initial game state
    initializeGame() {
        // Create main planet at center
        this.mainPlanet = new CelestialBody(this.canvas.width/2, this.canvas.height/2, 120, 8000, false, this.canvas);
         
        // Create orbiting planet
        this.planet = new CelestialBody(
            this.canvas.width/2 + this.ORBIT_RADIUS,
            this.canvas.height/2,
            40,
            2000,
            true,
            this.canvas
        );
        this.planet.color = '#4ecdc4';

        // Create player spacecraft
        this.spacecraft = new Spacecraft(this.canvas.width/2 + this.ORBIT_RADIUS, this.canvas.height/2 - 150);
         
        // Calculate stable orbital velocity for initial orbit
        const initialDistance = Math.sqrt(
            Math.pow(this.spacecraft.x - this.planet.x, 2) +
            Math.pow(this.spacecraft.y - this.planet.y, 2)
        );
        const orbitalVelocity = Math.sqrt((this.planet.mass * 0.01) / initialDistance);
        this.spacecraft.vx = orbitalVelocity;

        // Reset time settings
        this.timeWarp = 1.0;
        UIManager.updateTimeWarp(this.timeWarp);
        UIManager.updateStatus('Flying');
    },

    // Reset to initial game state
    resetGame() {
        this.initializeGame();
    },

    // Update game logic
    update() {
        if (!this.spacecraft.crashed) {
            // Handle keyboard controls
            if (this.inputManager.isKeyPressed('ArrowLeft')) {
                this.spacecraft.rotation -= this.spacecraft.rotationSpeed;
            }
            if (this.inputManager.isKeyPressed('ArrowRight')) {
                this.spacecraft.rotation += this.spacecraft.rotationSpeed;
            }
            if (this.inputManager.isKeyPressed('ArrowUp')) {
                // Apply thrust in direction of rotation
                this.spacecraft.vx += Math.cos(this.spacecraft.rotation) * this.spacecraft.thrustPower * this.timeWarp;
                this.spacecraft.vy += Math.sin(this.spacecraft.rotation) * this.spacecraft.thrustPower * this.timeWarp;
                this.spacecraft.addThrustParticle();
            }
            
            // Note: Touch controls are handled directly in the TouchControls class
            // and modify the spacecraft properties directly, so we don't need
            // additional handling here
        }
    
        // Update game objects
        this.orbitPredictor.predict(this.spacecraft, [this.mainPlanet, this.planet], this.timeWarp);
        this.spacecraft.update([this.mainPlanet, this.planet], this.timeWarp);
        this.camera.follow(this.spacecraft);
    },

    // Render game frame
    render() {
        const ctx = this.ctx;
        // Clear screen to black
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();

        // Render background
        ctx.save();
        RenderStarfield.drawStarfield(ctx, this.camera);
        ctx.restore();

        // Render game objects
        ctx.save();
        this.mainPlanet.draw(ctx, this.camera);
        this.planet.update(this.timeWarp);
        this.planet.draw(ctx, this.camera);
        this.orbitPredictor.draw(ctx, this.camera);
        this.spacecraft.draw(ctx, this.camera);
        ctx.restore();
    },

    // Main game loop
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
 };

 window.GameState = GameState;