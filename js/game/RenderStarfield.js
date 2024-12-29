// Static class handling game rendering operations
class RenderStarfield {
    // Draws a parallax scrolling starfield background
    static drawStarfield(ctx, camera) {
        // Save current canvas state
        ctx.save();
    
        // Set number of stars to render
        const numStars = 800;
    
        // Set star color to white
        ctx.fillStyle = 'white';

        // Generate each star
        for (let i = 0; i < numStars; i++) {
            // Calculate x position with parallax effect based on camera position
            // Uses sine wave and modulo to create wrapping effect
            const x = ((Math.sin(i) * 10000 - camera.x * 0.1) % ctx.canvas.width + ctx.canvas.width) % ctx.canvas.width;
        
            // Calculate y position similarly using cosine wave
            const y = ((Math.cos(i) * 10000 - camera.y * 0.1) % ctx.canvas.height + ctx.canvas.height) % ctx.canvas.height;
        
            // 10% chance for a larger 2px star, otherwise 1px
            const size = Math.random() < 0.1 ? 2 : 1;
        
            // Draw the star as a rectangle
            ctx.fillRect(x, y, size, size);
        }

        // Restore canvas state
        ctx.restore();
    }
}

window.RenderStarfield = RenderStarfield;
