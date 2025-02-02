// Class representing a planet or moon in the game
class CelestialBody {
    // Initialize celestial body with position, size, mass and orbital properties
    constructor(x, y, radius, mass, isOrbiting = false, gameCanvas) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        // Calculate sphere of influence - larger for main planet (mass 8000)
        this.sphereOfInfluence = radius * (mass === 8000 ? 20 : 8);
        // Default reddish color for celestial bodies
        this.color = '#ff6b6b';
        // Orbital properties
        this.isOrbiting = isOrbiting;
        this.orbitalAngle = 0;
        this.orbitalSpeed = 0.00005;
        // Only set orbital radius if body is orbiting
        this.orbitalRadius = isOrbiting ? GameState.ORBIT_RADIUS : 0;
        // Center point of orbit
        this.centerX = gameCanvas.width/2;
        this.centerY = gameCanvas.height/2;
    }

    // Update position if body is in orbit
    update(timeWarp) {
        if (this.isOrbiting) {
            // Increase orbital angle based on speed and time warp
            this.orbitalAngle += this.orbitalSpeed * timeWarp;
            // Calculate new position using circular motion
            this.x = this.centerX + Math.cos(this.orbitalAngle) * this.orbitalRadius;
            this.y = this.centerY + Math.sin(this.orbitalAngle) * this.orbitalRadius;
        }
    }

    // Render the celestial body
    draw(ctx, camera) {
        // Convert world coordinates to screen coordinates
        const screenX = (this.x - camera.x) * camera.zoom + ctx.canvas.width/2;
        const screenY = (this.y - camera.y) * camera.zoom + ctx.canvas.height/2;

        // Create glowing effect using radial gradient
        const gradient = ctx.createRadialGradient(
            screenX, screenY, this.radius * camera.zoom * 0.5,
            screenX, screenY, this.radius * camera.zoom
        );
        
        gradient.addColorStop(0, this.color + '33'); // Semi-transparent inner
        gradient.addColorStop(1, this.color + '00'); // Transparent outer

        // Draw the glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * camera.zoom, 0, Math.PI * 2);
        ctx.fill();

        // Draw the planet's outline
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * camera.zoom, 0, Math.PI * 2);
        ctx.stroke();

        // Optionally draw sphere of influence indicator
        if (GameState.showSphereOfInfluence) {
            ctx.setLineDash([5, 15]); // Dashed line pattern
            ctx.strokeStyle = this.color + '44'; // Semi-transparent
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.sphereOfInfluence * camera.zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line style
        }
    }

    // Check if spacecraft has collided with this body
    checkCollision(spacecraft) {
        // Calculate distance between body and spacecraft
        const dx = this.x - spacecraft.x;
        const dy = this.y - spacecraft.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Collision occurs if distance is less than body's radius
        return distance <= this.radius;
    }
}

window.CelestialBody = CelestialBody;
