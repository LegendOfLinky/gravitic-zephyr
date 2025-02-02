class TouchControls {
    constructor() {
        // Check if device has touch capabilities and/or mobile viewport
        this.isMobile = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches || 
            ('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0);
            
        // Desktop flag - can be toggled
        this.desktopEnabled = false;
        
        // Only initialize if on mobile or desktop controls are enabled
        if (this.isMobile || this.desktopEnabled) {
            this.init();
        }
    }

    init() {
        this.touching = false;
        this.origin = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 };
        
        // Create joystick container
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.bottom = '100px';
        this.container.style.right = '100px';
        this.container.style.width = '128px';
        this.container.style.height = '128px';
        this.container.style.borderRadius = '50%';
        this.container.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.container.style.backdropFilter = 'blur(4px)';
        this.container.style.touchAction = 'none';
        this.container.style.zIndex = '1000';

        // Create touch indicator
        this.indicator = document.createElement('div');
        this.indicator.style.position = 'absolute';
        this.indicator.style.width = '32px';
        this.indicator.style.height = '32px';
        this.indicator.style.borderRadius = '50%';
        this.indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        this.indicator.style.display = 'none';
        this.container.appendChild(this.indicator);

        // Add touch event listeners
        this.container.addEventListener('touchstart', this.handleStart.bind(this));
        this.container.addEventListener('touchmove', this.handleMove.bind(this));
        this.container.addEventListener('touchend', this.handleEnd.bind(this));
        
        // Add mouse event listeners only if desktop controls are enabled
        if (!this.isMobile && this.desktopEnabled) {
            this.container.addEventListener('mousedown', this.handleStart.bind(this));
            this.container.addEventListener('mousemove', this.handleMove.bind(this));
            this.container.addEventListener('mouseup', this.handleEnd.bind(this));
            this.container.addEventListener('mouseleave', this.handleEnd.bind(this));
        }
        
        // Add to document
        document.body.appendChild(this.container);
    }

    // Method to toggle desktop controls
    setDesktopEnabled(enabled) {
        this.desktopEnabled = enabled;
        
        if (!this.isMobile) {  // Only process for desktop
            if (enabled && !this.container) {
                // Initialize if enabling and not yet initialized
                this.init();
            } else if (!enabled && this.container) {
                // Remove the control if disabling
                this.container.remove();
                this.container = null;
            }
        }
    }

    handleStart(e) {
        e.preventDefault();
        const point = e.touches ? e.touches[0] : e;
        
        this.touching = true;
        this.origin = {
            x: point.clientX,
            y: point.clientY
        };
        this.position = { ...this.origin };
        
        // Show and position the indicator
        this.indicator.style.display = 'block';
        this.indicator.style.left = '48px';
        this.indicator.style.top = '48px';
    }

    handleMove(e) {
        e.preventDefault();
        if (!this.touching) return;

        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - this.origin.x;
        const dy = point.clientY - this.origin.y;
        
        // Calculate distance and angle
        const distance = Math.min(50, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);
        
        // Update indicator position
        this.indicator.style.left = `${48 + dx}px`;
        this.indicator.style.top = `${48 + dy}px`;
        
        // Update spacecraft if it exists
        if (window.GameState && window.GameState.spacecraft) {
            const spacecraft = window.GameState.spacecraft;
            spacecraft.rotation = angle;
            
            // Apply thrust if the touch/mouse point is far enough from center
            if (distance > 20) {
                spacecraft.vx += Math.cos(angle) * spacecraft.thrustPower * window.GameState.timeWarp;
                spacecraft.vy += Math.sin(angle) * spacecraft.thrustPower * window.GameState.timeWarp;
                spacecraft.addThrustParticle();
            }
        }
        
        this.position = {
            x: point.clientX,
            y: point.clientY
        };
    }

    handleEnd(e) {
        e.preventDefault();
        this.touching = false;
        this.indicator.style.display = 'none';
    }
}

// Add to window object for global access
window.TouchControls = TouchControls;