class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.baseColor = color;  // Store the original color
        this.color = color;
        this.originalX = x;
        this.originalY = y;
        this.returnSpeed = 0.05;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * dispersionRange;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
    }

    draw(mouseX, mouseY, panX, panY, scale) {
        // Calculate distance to mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Define the radius of influence for the lighting effect
        const lightRadius = 100;

        // Calculate lighting factor based on distance
        let lightFactor = 0;
        if (distance < lightRadius) {
            lightFactor = (1 - distance / lightRadius) * 0.7; // Max 70% lighter
        }

        // Update current color based on distance to mouse
        this.color = lightFactor > 0 ? this.lightenColor(this.baseColor, lightFactor) : this.baseColor;

        // Save current context state
        ctxParticle.save();

        // Apply transformations for drawing (with panning and scaling)
        ctxParticle.translate(panX, panY);
        ctxParticle.scale(scale, scale);

        // Drawing logic
        ctxParticle.fillStyle = this.color;
        ctxParticle.strokeStyle = this.color;

        switch (particleShape) {
            case 'circle':
                ctxParticle.beginPath();
                ctxParticle.arc(this.x, this.y, particleSize, 0, Math.PI * 2);
                ctxParticle.closePath();
                ctxParticle.fill();
                break;
            case 'square':
                ctxParticle.fillRect(this.x - particleSize, this.y - particleSize, particleSize * 2, particleSize * 2);
                break;
            case 'star':
                this.drawStar();
                break;
        }

        // Restore the original context state
        ctxParticle.restore();
    }

    drawStar() {
        const spikes = 5;
        const outerRadius = particleSize;
        const innerRadius = particleSize / 2;

        ctxParticle.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            if (i === 0) ctxParticle.moveTo(x, y);
            else ctxParticle.lineTo(x, y);
        }
        ctxParticle.closePath();
        ctxParticle.fill();
    }

    update() {
        this.angle += this.angularSpeed * particleSpeed;

        const targetX = this.originalX + Math.cos(this.angle) * this.radius;
        const targetY = this.originalY + Math.sin(this.angle) * this.radius;

        this.x += (targetX - this.x) * this.returnSpeed;
        this.y += (targetY - this.y) * this.returnSpeed;

        this.x += (Math.random() - 0.5) * particleSpeed;
        this.y += (Math.random() - 0.5) * particleSpeed;

        const targetRadius = Math.random() * dispersionRange;
        this.radius += (targetRadius - this.radius) * 0.1;
    }

    lightenColor(baseColor, lightFactor) {
        const color = baseColor.match(/\d+/g).map(Number); // Extract RGB values from baseColor string

        // Calculate new RGB values by adding a percentage of the distance factor
        const newColor = color.map(c => Math.min(255, Math.floor(c + (255 - c) * lightFactor)));

        // Return the new color in rgba format (with same alpha)
        return `rgba(${newColor[0]}, ${newColor[1]}, ${newColor[2]}, 1)`;
    }
}
