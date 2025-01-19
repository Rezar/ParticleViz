class Particle {
    constructor(x, y, z, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
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

    draw() {
        const zScale = 1 + this.z / 1000;
        const adjustedSize = particleSize / zScale;

        ctxParticle.save();
        ctxParticle.translate(particleCanvas.width / 2, particleCanvas.height / 2);

        // Apply opacity to the color
        const rgba = this.color.match(/[\d.]+/g);
        const color = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${particleOpacity})`;
        ctxParticle.fillStyle = color;
        ctxParticle.strokeStyle = color;

        switch (particleShape) {
            case 'circle':
                ctxParticle.beginPath();
                ctxParticle.arc(this.x, this.y, adjustedSize, 0, Math.PI * 2);
                ctxParticle.closePath();
                ctxParticle.fill();
                break;
            case 'square':
                ctxParticle.fillRect(
                    this.x - adjustedSize,
                    this.y - adjustedSize,
                    adjustedSize * 2,
                    adjustedSize * 2
                );
                break;
            case 'star':
                this.drawStar(adjustedSize);
                break;
        }

        ctxParticle.restore();
    }

    drawStar(size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size / 2;

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
        // Update angles for orbital motion with scaling to control speed
        this.angleXY += this.angularSpeedXY * Math.sqrt(particleSpeed);
        this.angleXZ += this.angularSpeedXZ * Math.sqrt(particleSpeed);
    
        // Calculate position before rotation
        const orbitX = this.originalX + Math.cos(this.angleXY) * this.radius;
        const orbitY = this.originalY + Math.sin(this.angleXY) * this.radius;
        const orbitZ = this.originalZ + Math.sin(this.angleXZ) * this.radius;
    
        // Use either auto-rotation or slider rotation
        let angle;
        if (autoRotate) {
            this.autoRotationAngle = (this.autoRotationAngle + autoRotationSpeed) % 360;
            angle = (this.autoRotationAngle * Math.PI) / 180;
        } else {
            angle = (rotationAngle * Math.PI) / 180;
        }
    
        // Apply rotation
        const rotatedX = orbitX * Math.cos(angle) + orbitZ * Math.sin(angle);
        const rotatedZ = -orbitX * Math.sin(angle) + orbitZ * Math.cos(angle);
    
        // Smoothly update particle positions with target positions
        this.x += (rotatedX - this.x) * this.returnSpeed;
        this.y += (orbitY - this.y) * this.returnSpeed;
        this.z += (rotatedZ - this.z) * this.returnSpeed;
    
        // Apply additional randomness with scaled speed
        this.x += (Math.random() - 0.5) * particleSpeed;
        this.y += (Math.random() - 0.5) * particleSpeed;
        this.z += (Math.random() - 0.5) * particleSpeed;
    
        // Gradually update the radius for dispersion
        const targetRadius = Math.random() * dispersionRange;
        this.radius += (targetRadius - this.radius) * 0.02;
    
        // Smoothly adjust original Z position for dispersion effects
        const targetOriginalZ = this.originalZ + (Math.random() - 0.5) * dispersionRange * 0.05;
        this.originalZ += (targetOriginalZ - this.originalZ) * 0.02;
    }
}