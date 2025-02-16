class OrbitPredictor {
    constructor() {
        this.positions = [];
        this.orbitalPeriod = 0;
        this.predictionQuality = Config.PREDICTION.QUALITY;
        this.targetOrbits = Config.PREDICTION.TARGET_ORBITS;
        this.transitionPoints = [];
    }

    calculateDominantBody(x, y, bodies) {
        let closest = null;
        let minDistance = Infinity;

        for (const body of bodies) {
            const dx = body.x - x;
            const dy = body.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= body.sphereOfInfluence &&
                (!closest || body.mass > closest.mass)) {
                closest = body;
                minDistance = distance;
            }
        }

        return closest;
    }

    calculateOrbitalPeriod(spacecraft, bodies) {
        let dominantBody = null;
        let strongestGravity = 0;

        for (const body of bodies) {
            const dx = body.x - spacecraft.x;
            const dy = body.y - spacecraft.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const gravity = body.mass / (distance * distance);

            if (gravity > strongestGravity) {
                strongestGravity = gravity;
                dominantBody = body;
            }
        }

        if (!dominantBody) return 50000;

        const dx = dominantBody.x - spacecraft.x;
        const dy = dominantBody.y - spacecraft.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const period = 2 * Math.PI * Math.sqrt(
            (distance * distance * distance) /
            (dominantBody.mass * Config.PHYSICS.GRAVITY_CONSTANT)
        );

        UIManager.updateOrbitalPeriod(period);
        return period;
    }

    predict(spacecraft, bodies, timeWarp) {
        this.positions = [];
        this.transitionPoints = [];

        let predictX = spacecraft.x;
        let predictY = spacecraft.y;
        let predictVx = spacecraft.vx;
        let predictVy = spacecraft.vy;

        let currentDominantBody = this.calculateDominantBody(predictX, predictY, bodies);
        this.orbitalPeriod = this.calculateOrbitalPeriod(spacecraft, [currentDominantBody]);

        const stepsPerOrbit = this.predictionQuality;
        const totalSteps = Math.floor(stepsPerOrbit * this.targetOrbits);
        const timeStep = timeWarp;
        let orbitCount = 0;

        let lastAngle = Math.atan2(
            predictY - (currentDominantBody?.y || 0),
            predictX - (currentDominantBody?.x || 0)
        );
        let angleAccumulator = 0;

        for (let i = 0; i < totalSteps && orbitCount < this.targetOrbits; i++) {
            let totalFx = 0;
            let totalFy = 0;

            for (const body of bodies) {
                const bodyX = body.x;
                const bodyY = body.y;

                const dx = bodyX - predictX;
                const dy = bodyY - predictY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= body.radius) return;

                const force = (body.mass * Config.PHYSICS.GRAVITY_CONSTANT) / (distance * distance) * timeStep;
                const angle = Math.atan2(dy, dx);

                totalFx += Math.cos(angle) * force;
                totalFy += Math.sin(angle) * force;
            }

            predictVx += totalFx;
            predictVy += totalFy;
            predictX += predictVx * timeStep;
            predictY += predictVy * timeStep;

            const newDominantBody = this.calculateDominantBody(predictX, predictY, bodies);

            if (newDominantBody !== currentDominantBody) {
                this.transitionPoints.push({
                    x: predictX,
                    y: predictY,
                    enteringBody: newDominantBody
                });
            }

            if (newDominantBody === currentDominantBody && currentDominantBody) {
                const newAngle = Math.atan2(
                    predictY - currentDominantBody.y,
                    predictX - currentDominantBody.x
                );
                const angleDiff = ((newAngle - lastAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                angleAccumulator += angleDiff;

                if (Math.abs(angleAccumulator) >= Math.PI * 2) {
                    orbitCount++;
                    angleAccumulator = 0;
                }
                lastAngle = newAngle;
            }

            if (newDominantBody !== currentDominantBody) {
                currentDominantBody = newDominantBody;
                this.orbitalPeriod = this.calculateOrbitalPeriod(
                    { x: predictX, y: predictY, vx: predictVx, vy: predictVy },
                    [currentDominantBody]
                );
                angleAccumulator = 0;
                if (currentDominantBody) {
                    lastAngle = Math.atan2(
                        predictY - currentDominantBody.y,
                        predictX - currentDominantBody.x
                    );
                }
            }

            const opacity = Math.max(Config.PREDICTION.MIN_OPACITY, 1 - (orbitCount / this.targetOrbits));

            this.positions.push({
                x: predictX,
                y: predictY,
                opacity: opacity,
                dominantBody: currentDominantBody
            });
        }
    }

    draw(ctx, camera) {
        if (this.positions.length < 2) return;

        if (!GameState.showSphereOfInfluence) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;

            for (let i = 1; i < this.positions.length; i++) {
                const pos = this.positions[i];
                const prevPos = this.positions[i - 1];

                const screenX = (pos.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
                const screenY = (pos.y - camera.y) * camera.zoom + ctx.canvas.height / 2;
                const prevScreenX = (prevPos.x - camera.x) * camera.zoom + ctx.canvas.width / 2;
                const prevScreenY = (prevPos.y - camera.y) * camera.zoom + ctx.canvas.height / 2;

                if (i === 1) {
                    ctx.moveTo(prevScreenX, prevScreenY);
                }
                ctx.lineTo(screenX, screenY);
            }
            ctx.stroke();
        } else {
            let currentDominantBody = null;
            ctx.lineWidth = 1;

            for (let i = 1; i < this.positions.length; i++) {
                const pos = this.positions[i];
                const prevPos = this.positions[i - 1];

                if (pos.dominantBody !== currentDominantBody) {
                    if (currentDominantBody !== null) {
                        ctx.stroke();
                    }
                    currentDominantBody = pos.dominantBody;
                    ctx.beginPath();
                    ctx.strokeStyle = currentDominantBody ? `${currentDominantBody.color}dd` : '#ffffffdd';
                }

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
}

window.OrbitPredictor = OrbitPredictor;