const GameState = {
    showSphereOfInfluence: false,
    timeWarp: 1.0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.inputManager = new InputManager();
        this.camera = new Camera();
        this.orbitPredictor = new OrbitPredictor();
        this.touchControls = new TouchControls();

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
        });

        this.setupEventListeners();
        this.initializeGame();
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 't' || e.key === 'T') {
                this.showSphereOfInfluence = !this.showSphereOfInfluence;
            }
            if (e.key === '[' && this.timeWarp > Config.PHYSICS.TIME_WARP_MIN) {
                this.timeWarp *= 0.5;
                UIManager.updateTimeWarp(this.timeWarp);
            }
            if (e.key === ']' && this.timeWarp < Config.PHYSICS.TIME_WARP_MAX) {
                this.timeWarp *= 2.0;
                UIManager.updateTimeWarp(this.timeWarp);
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.targetZoom *= e.deltaY > 0 ? 0.9 : 1.1;
            this.camera.targetZoom = Math.max(0.1, Math.min(this.camera.targetZoom, 5));
        });

        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
    },

    initializeGame() {
        // Initialize celestial bodies
        this.sun = new CelestialBody(Config.CELESTIAL.SUN);
        this.earth = new CelestialBody(Config.CELESTIAL.EARTH);
        this.moon = new CelestialBody(Config.CELESTIAL.MOON);

        // Set up orbital relationships
        this.earth.setOrbitReference(this.sun);
        this.moon.setOrbitReference(this.earth);

        // Create spacecraft near Earth
        const earthPos = this.earth.getPosition();
        // Position spacecraft farther from Earth and adjust for orbit
        this.spacecraft = new Spacecraft(
            earthPos.x,
            earthPos.y - 300
        );

        // Calculate initial stable orbit velocity
        const initialDistance = Math.sqrt(
            Math.pow(this.spacecraft.x - this.earth.x, 2) +
            Math.pow(this.spacecraft.y - this.earth.y, 2)
        );
        const orbitalVelocity = Math.sqrt((this.earth.mass * Config.PHYSICS.GRAVITY_CONSTANT) / initialDistance);
        this.spacecraft.vx = orbitalVelocity;

        // Reset time settings
        this.timeWarp = 1.0;
        UIManager.updateTimeWarp(this.timeWarp);
        UIManager.updateStatus('Flying');
    },

    resetGame() {
        this.initializeGame();
    },

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
                this.spacecraft.vx += Math.cos(this.spacecraft.rotation) * Config.SPACECRAFT.THRUST_POWER * this.timeWarp;
                this.spacecraft.vy += Math.sin(this.spacecraft.rotation) * Config.SPACECRAFT.THRUST_POWER * this.timeWarp;
                this.spacecraft.addThrustParticle();
            }
        }

        // Update game objects
        this.orbitPredictor.predict(this.spacecraft, [this.sun, this.earth, this.moon], this.timeWarp);
        this.spacecraft.update([this.sun, this.earth, this.moon], this.timeWarp);

        // Update celestial body positions
        this.earth.update(this.timeWarp);
        this.moon.update(this.timeWarp);

        this.camera.follow(this.spacecraft);
    },

    render() {
        const ctx = this.ctx;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        RenderStarfield.drawStarfield(ctx, this.camera);
        ctx.restore();

        ctx.save();
        this.sun.draw(ctx, this.camera);
        this.earth.draw(ctx, this.camera);
        this.moon.draw(ctx, this.camera);
        this.orbitPredictor.draw(ctx, this.camera);
        this.spacecraft.draw(ctx, this.camera);
        ctx.restore();
    },

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
};

window.GameState = GameState;