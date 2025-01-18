class Particle {
    constructor(x, y, z, color, speed = 1) {
        // Merging properties from both classes
        this.x = x;
        this.y = y;
        this.z = z; // Replaces `depth` to Z 
        this.color = color;
        this.speed = speed;

        // Properties from `new_particle.js`
        this.initialPos = { x, y }; // Store initial position
        this.pos = { x, y };
        this.angle = 0; // Starting angle for movement pattern
        this.radius = 1; // Initial radius for spiral or other patterns
        this.createSurface();

        // Properties from `particle.js`
        this.originalX = x - particleCanvas.width / 2; // Store relative to center
        this.originalY = y - particleCanvas.height / 2; // Store relative to center
        this.originalZ = z;
        this.returnSpeed = 0.05;
        this.angleXY = Math.random() * Math.PI * 2;
        this.angleXZ = Math.random() * Math.PI * 2;
        this.radius = Math.random() * dispersionRange;
        this.angularSpeedXY = (Math.random() - 0.5) * 0.02;
        this.angularSpeedXZ = (Math.random() - 0.5) * 0.02;
        this.autoRotationAngle = 0;
    }

    createSurface() {
        // Adjust radius and color based on z
        this.drawRadius = Math.max(1, Math.floor(5 * (1 / (0.1 + this.z))));
        this.adjustedColor = this.color.map(c => Math.min(255, Math.floor(c * (1 / (0.1 + this.z)))));
    }

    draw(ctx) {
        const zScale = 1 + this.z / 1000; // Adjust scale for depth effect
        const adjustedSize = particleSize / zScale;

        ctx.save();
        ctx.translate(particleCanvas.width / 2, particleCanvas.height / 2);

        ctx.fillStyle = `rgb(${this.adjustedColor[0]}, ${this.adjustedColor[1]}, ${this.adjustedColor[2]})`;

        switch (particleShape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, adjustedSize, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(
                    this.pos.x - adjustedSize,
                    this.pos.y - adjustedSize,
                    adjustedSize * 2,
                    adjustedSize * 2
                );
                break;
            case 'star':
                this.drawStar(ctx, adjustedSize);
                break;
        }

        ctx.restore();
    }

    drawStar(ctx, size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size / 2;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = this.pos.x + Math.cos(angle) * radius;
            const y = this.pos.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    moveInPattern(dt) {
        this.angle += this.speed * dt * (1 / (0.5 + this.z));

        const movementRadius = 20 * (1 / (0.1 + this.z));
        this.pos.x = this.initialPos.x + movementRadius * Math.cos(this.angle);
        this.pos.y = this.initialPos.y + movementRadius * Math.sin(this.angle);
    }

    update(ctx, dt) {
        this.moveInPattern(dt);

        // Update orbital motion and positions
        this.angleXY += this.angularSpeedXY * Math.sqrt(particleSpeed);
        this.angleXZ += this.angularSpeedXZ * Math.sqrt(particleSpeed);

        const orbitX = this.originalX + Math.cos(this.angleXY) * this.radius;
        const orbitY = this.originalY + Math.sin(this.angleXY) * this.radius;
        const orbitZ = this.originalZ + Math.sin(this.angleXZ) * this.radius;

        let angle = autoRotate
            ? (this.autoRotationAngle += autoRotationSpeed) % 360
            : (rotationAngle * Math.PI) / 180;

        const rotatedX = orbitX * Math.cos(angle) + orbitZ * Math.sin(angle);
        const rotatedZ = -orbitX * Math.sin(angle) + orbitZ * Math.cos(angle);

        this.x += (rotatedX - this.x) * this.returnSpeed;
        this.y += (orbitY - this.y) * this.returnSpeed;
        this.z += (rotatedZ - this.z) * this.returnSpeed;

        this.draw(ctx);
    }
}
