// OrbitPredictor class handles orbital trajectory prediction and visualization
// for spacecraft in a multi-body gravitational system. It calculates future
// positions, orbital periods, and sphere of influence transitions.
class OrbitPredictor {
    // Initialize the orbit predictor with default settings
    // - positions: Array to store predicted spacecraft positions
    // - orbitalPeriod: Time for one complete orbit (initialized to 0)
    // - predictionQuality: Number of points calculated per orbit (higher = more accurate)
    // - targetOrbits: Number of orbits to predict ahead
    // - transitionPoints: Array to store sphere of influence transition locations
    constructor() {
        this.positions = [];
        this.orbitalPeriod = 0;
        this.predictionQuality = 2000;
        this.targetOrbits = 5;
        this.transitionPoints = [];
    }

    // Calculate the future position of a planet at a given timestep
    // Parameters:
    // - planet: Planet object containing orbital parameters
    // - timestep: Future time point to calculate position for
    // Returns: {x, y} coordinates of the planet's future position
    getPlanetPosition(planet, timestep) {
        if (!planet.isOrbiting) return { x: planet.x, y: planet.y };
        
        const futureAngle = planet.orbitalAngle + planet.orbitalSpeed * timestep;
        return {
            x: planet.centerX + Math.cos(futureAngle) * planet.orbitalRadius,
            y: planet.centerY + Math.sin(futureAngle) * planet.orbitalRadius
        };
    }

    // Determine which celestial body has the strongest gravitational influence
    // at a specific point in space and time
    // Parameters:
    // - x, y: Position to check
    // - planets: Array of all celestial bodies
    // - timestep: Time point to calculate influences for
    // Returns: Planet object with strongest gravitational influence
    calculateDominantBody(x, y, planets, timestep) {
        // First check if point is within small planet's sphere of influence
        const smallPlanet = planets.find(p => p.isOrbiting);
        if (smallPlanet) {
            const futurePos = this.getPlanetPosition(smallPlanet, timestep);
            const dx = futurePos.x - x;
            const dy = futurePos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
                
            if (distance <= smallPlanet.sphereOfInfluence) {
                return smallPlanet;
            }
        }

        // Then check main planet's sphere of influence
        const mainPlanet = planets.find(p => !p.isOrbiting);
        if (mainPlanet) {
            const dx = mainPlanet.x - x;
            const dy = mainPlanet.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
                
            if (distance <= mainPlanet.sphereOfInfluence) {
                return mainPlanet;
            }
        }

        // If not in any sphere of influence, return closest body
        let closest = null;
        let minDistance = Infinity;
        
        for (const planet of planets) {
            const futurePos = this.getPlanetPosition(planet, timestep);
            const dx = futurePos.x - x;
            const dy = futurePos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                closest = planet;
            }
        }
            
        return closest;
    }

    // Calculate the orbital period of the spacecraft around its dominant body
    // Parameters:
    // - spacecraft: Object containing spacecraft position and velocity
    // - planets: Array of celestial bodies
    // - timestep: Current simulation time
    // Returns: Orbital period in time units
    calculateOrbitalPeriod(spacecraft, planets, timestep) {
        // Find body with strongest gravitational pull
        let dominantPlanet = null;
        let strongestGravity = 0;
        
        for (const planet of planets) {
            const futurePos = this.getPlanetPosition(planet, timestep);
            const dx = futurePos.x - spacecraft.x;
            const dy = futurePos.y - spacecraft.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const gravity = planet.mass / (distance * distance);
            
            if (gravity > strongestGravity) {
                strongestGravity = gravity;
                dominantPlanet = planet;
            }
        }

        if (!dominantPlanet) return 50000; // Default period if no dominant body found

        // Calculate orbital period using simplified Kepler's Third Law
        const dx = dominantPlanet.x - spacecraft.x;
        const dy = dominantPlanet.y - spacecraft.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const period = 2 * Math.PI * Math.sqrt((distance * distance * distance) / (dominantPlanet.mass * 0.01));
        UIManager.updateOrbitalPeriod(period);
        return period;
    }

    // Predict future spacecraft trajectory considering gravitational influences
    // Parameters:
    // - spacecraft: Object containing current position and velocity
    // - planets: Array of celestial bodies
    // - timeWarp: Time acceleration factor
    predict(spacecraft, planets, timeWarp) {
        this.positions = [];
        this.transitionPoints = [];

        // Initialize prediction variables
        let predictX = spacecraft.x;
        let predictY = spacecraft.y;
        let predictVx = spacecraft.vx;
        let predictVy = spacecraft.vy;

        let currentTimestep = 0;
        let currentDominantBody = this.calculateDominantBody(predictX, predictY, planets, currentTimestep);
        this.orbitalPeriod = this.calculateOrbitalPeriod(spacecraft, [currentDominantBody], currentTimestep);
        
        // Setup simulation parameters
        const stepsPerOrbit = this.predictionQuality;
        const totalSteps = Math.floor(stepsPerOrbit * this.targetOrbits);
        const timeStep = timeWarp;
        let orbitCount = 0;
        
        // Track orbital progress using angle accumulation
        let lastAngle = Math.atan2(predictY - currentDominantBody.y, predictX - currentDominantBody.x);
        let angleAccumulator = 0;

        // Main prediction loop
        for (let i = 0; i < totalSteps && orbitCount < this.targetOrbits; i++) {
            currentTimestep = timeStep * i;
            let totalFx = 0;
            let totalFy = 0;

            // Calculate gravitational forces from all bodies
            for (const planet of planets) {
                const futurePos = this.getPlanetPosition(planet, currentTimestep);
                const dx = futurePos.x - predictX;
                const dy = futurePos.y - predictY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Stop prediction if collision detected
                if (distance <= planet.radius) {
                    return;
                }
                
                // Apply gravitational force
                const force = (planet.mass / (distance * distance)) * 0.01 * timeStep;
                const angle = Math.atan2(dy, dx);
                
                totalFx += Math.cos(angle) * force;
                totalFy += Math.sin(angle) * force;
            }

            // Update velocity and position
            predictVx += totalFx;
            predictVy += totalFy;
            predictX += predictVx * timeStep;
            predictY += predictVy * timeStep;

            // Check for sphere of influence transitions
            const newDominantBody = this.calculateDominantBody(predictX, predictY, planets, currentTimestep);
            
            if (newDominantBody !== currentDominantBody) {
                this.transitionPoints.push({
                    x: predictX,
                    y: predictY,
                    enteringBody: newDominantBody,
                    timestep: currentTimestep
                });
            }
            
            // Track orbital progress
            if (newDominantBody === currentDominantBody) {
                const bodyPos = this.getPlanetPosition(currentDominantBody, currentTimestep);
                const newAngle = Math.atan2(predictY - bodyPos.y, predictX - bodyPos.x);
                const angleDiff = ((newAngle - lastAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                angleAccumulator += angleDiff;
                if (Math.abs(angleAccumulator) >= Math.PI * 2) {
                    orbitCount++;
                    angleAccumulator = 0;
                }
                lastAngle = newAngle;
            }

            // Handle sphere of influence transition
            if (newDominantBody !== currentDominantBody) {
                currentDominantBody = newDominantBody;
                this.orbitalPeriod = this.calculateOrbitalPeriod(
                    { x: predictX, y: predictY, vx: predictVx, vy: predictVy },
                    [currentDominantBody],
                    currentTimestep
                );
                angleAccumulator = 0;
                const bodyPos = this.getPlanetPosition(currentDominantBody, currentTimestep);
                lastAngle = Math.atan2(predictY - bodyPos.y, predictX - bodyPos.x);
            }

            // Calculate trajectory line opacity based on orbit count
            const opacity = Math.max(0.2, 1 - (orbitCount / this.targetOrbits));

            // Store predicted position
            this.positions.push({
                x: predictX,
                y: predictY,
                opacity: opacity,
                dominantBody: currentDominantBody,
                timestep: currentTimestep
            });
        }
    }

    // Render the predicted trajectory and sphere of influence transition points
    // Parameters:
    // - ctx: Canvas rendering context
    // - camera: Camera object containing view parameters
    draw(ctx, camera) {
        if (this.positions.length < 2) return;

        // Draw trajectory lines colored by dominant body
        let currentDominantBody = null;
        ctx.lineWidth = 1;

        for (let i = 1; i < this.positions.length; i++) {
            const pos = this.positions[i];
            const prevPos = this.positions[i - 1];

            // Start new path when dominant body changes
            if (pos.dominantBody !== currentDominantBody) {
                if (currentDominantBody !== null) {
                    ctx.stroke();
                }
                currentDominantBody = pos.dominantBody;
                ctx.beginPath();
                ctx.strokeStyle = currentDominantBody ? `${currentDominantBody.color}dd` : '#ffffffdd';
            }

            // Convert to screen coordinates
            const screenX = (pos.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
            const screenY = (pos.y - camera.y) * camera.zoom + ctx.canvas.height / 2;
            const prevScreenX = (prevPos.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
            const prevScreenY = (prevPos.y - camera.y) * camera.zoom + ctx.canvas.height / 2;

            if (i === 1 || pos.dominantBody !== prevPos.dominantBody) {
                ctx.moveTo(prevScreenX, prevScreenY);
            }
            ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();

        // Draw sphere of influence transition points
        for (const point of this.transitionPoints) {
            const screenX = (point.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
            const screenY = (point.y - camera.y) * camera.zoom + ctx.canvas.height / 2;

            ctx.beginPath();
            ctx.fillStyle = point.enteringBody ? point.enteringBody.color : '#ffffff';
            ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Make OrbitPredictor available globally
window.OrbitPredictor = OrbitPredictor;