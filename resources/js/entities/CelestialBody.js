class CelestialBody {
    constructor(config) {
        this.id = config.id;
        this.radius = config.radius;
        this.mass = config.mass;
        this.sphereOfInfluence = config.radius * config.soiScale;
        this.color = config.color;
        this.isVisible = config.isVisible;

        // Position properties
        this.x = config.x;
        this.y = config.y;

        // Orbital properties
        this.isOrbiting = config.isOrbiting;
        this.orbitalHeight = config.orbitalHeight;
        this.orbitalSpeed = config.orbitalSpeed;
        this.orbitalAngle = config.orbitalPhase;

        // Reference to body we orbit around
        this.orbitReference = null;
    }

    // Set which body we orbit around
    setOrbitReference(body) {
        this.orbitReference = body;
    }

    // Get current position (for other bodies to reference)
    getPosition() {
        return { x: this.x, y: this.y };
    }

    update(timeWarp) {
        if (this.isOrbiting && this.orbitReference) {
            const centerPos = this.orbitReference.getPosition();

            this.orbitalAngle += this.orbitalSpeed * timeWarp;
            this.x = centerPos.x + Math.cos(this.orbitalAngle) * this.orbitalHeight;
            this.y = centerPos.y + Math.sin(this.orbitalAngle) * this.orbitalHeight;
        }
    }

    draw(ctx, camera) {
        if (!this.isVisible) return;

        const screenX = (this.x - camera.x) * camera.zoom + ctx.canvas.width/2;
        const screenY = (this.y - camera.y) * camera.zoom + ctx.canvas.height/2;

        const gradient = ctx.createRadialGradient(
            screenX, screenY, this.radius * camera.zoom * 0.5,
            screenX, screenY, this.radius * camera.zoom
        );

        gradient.addColorStop(0, this.color + '33');
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * camera.zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * camera.zoom, 0, Math.PI * 2);
        ctx.stroke();

        if (GameState.showSphereOfInfluence) {
            ctx.setLineDash([5, 15]);
            ctx.strokeStyle = this.color + '44';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.sphereOfInfluence * camera.zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    checkCollision(spacecraft) {
        const dx = this.x - spacecraft.x;
        const dy = this.y - spacecraft.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}

window.CelestialBody = CelestialBody;