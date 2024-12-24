export function generateShipTexture(scene) {
    const graphics = scene.add.graphics();
    
    // Draw triangular ship
    graphics.lineStyle(2, 0x00ff00);
    graphics.fillStyle(0x00ff00, 1);
    
    graphics.beginPath();
    graphics.moveTo(0, -20);
    graphics.lineTo(15, 20);
    graphics.lineTo(-15, 20);
    graphics.closePath();
    
    graphics.strokePath();
    graphics.fillPath();
    
    graphics.generateTexture('ship', 30, 40);
    graphics.destroy();
}

export function generateAsteroidTexture(scene) {
    const graphics = scene.add.graphics();
    
    // Draw circular asteroid
    graphics.lineStyle(2, 0x888888);
    graphics.fillStyle(0x666666, 1);
    
    graphics.beginPath();
    graphics.arc(25, 25, 20, 0, Math.PI * 2);
    graphics.closePath();
    
    graphics.strokePath();
    graphics.fillPath();
    
    graphics.generateTexture('asteroid', 50, 50);
    graphics.destroy();
}

export function generatePowerupTexture(scene) {
    const graphics = scene.add.graphics();
    
    // Draw star-shaped powerup
    graphics.lineStyle(2, 0xffff00);
    graphics.fillStyle(0xffff00, 1);
    
    const points = [];
    const outerRadius = 15;
    const innerRadius = 7;
    
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / 10;
        points.push({
            x: Math.cos(angle) * radius + 20,
            y: Math.sin(angle) * radius + 20
        });
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
    
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();
    
    graphics.generateTexture('powerup', 40, 40);
    graphics.destroy();
}
