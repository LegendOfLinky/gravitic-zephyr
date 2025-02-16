class Spacecraft {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.thrustPower = Config.SPACECRAFT.THRUST_POWER;
        this.rotationSpeed = Config.SPACECRAFT.ROTATION_SPEED;
        this.thrustHistory = [];
        this.crashed = false;
    }

    update(bodies, timeWarp) {
        if (this.crashed) return;

        for (const body of bodies) {
            if (body.checkCollision(this)) {
                this.crashed = true;
                UIManager.updateStatus('Crashed!');
                return;
            }

            const dx = body.x - this.x;
            const dy = body.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = (body.mass * Config.PHYSICS.GRAVITY_CONSTANT / (distance * distance)) * timeWarp;
            const angle = Math.atan2(dy, dx);

            this.vx += Math.cos(angle) * force;
            this.vy += Math.sin(angle) * force;
        }

        this.x += this.vx * timeWarp;
        this.y += this.vy * timeWarp;

        const orbitalVelocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        UIManager.updateOrbitalVelocity(orbitalVelocity);

        let closestDistance = Infinity;
        for (const body of bodies) {
            const dx = body.x - this.x;
            const dy = body.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) - body.radius;
            if (distance < closestDistance) {
                closestDistance = distance;
            }
        }
        UIManager.updateAltitude(closestDistance);
    }

    addThrustParticle() {
        if (this.crashed) return;

        if (this.thrustHistory.length > Config.RENDER.PARTICLE_COUNT) {
            this.thrustHistory.shift();
        }

        const randomSpeed = 2 + Math.random();
        const randomOffset = (Math.random() - 0.5) * 0.2;

        this.thrustHistory.push({
            x: this.x - Math.cos(this.rotation) * 7,
            y: this.y - Math.sin(this.rotation) * 7,
            vx: -Math.cos(this.rotation + randomOffset) * randomSpeed,
            vy: -Math.sin(this.rotation + randomOffset) * randomSpeed,
            life: Config.RENDER.PARTICLE_LIFE,
            size: 2 + Math.random()
        });
    }

    draw(ctx, camera) {
        this.thrustHistory.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            const screenX = (particle.x - camera.x) * camera.zoom + ctx.canvas.width/2;
            const screenY = (particle.y - camera.y) * camera.zoom + ctx.canvas.height/2;

            const opacity = particle.life / Config.RENDER.PARTICLE_LIFE;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, particle.size * camera.zoom, 0, Math.PI * 2);
            ctx.fill();

            particle.life -= 0.7;
        });

        this.thrustHistory = this.thrustHistory.filter(p => p.life > 0);

        const screenX = (this.x - camera.x) * camera.zoom + ctx.canvas.width/2;
        const screenY = (this.y - camera.y) * camera.zoom + ctx.canvas.height/2;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.crashed ? 'red' : 'white';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(10 * camera.zoom, 0);
        ctx.lineTo(-5 * camera.zoom, 5 * camera.zoom);
        ctx.lineTo(-5 * camera.zoom, -5 * camera.zoom);
        ctx.closePath();
        ctx.stroke();

        if (!this.crashed) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        ctx.restore();
    }
}

window.Spacecraft = Spacecraft;