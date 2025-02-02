// Camera class to handle view positioning and zoom
class Camera {
    // Initialize camera at origin with default zoom settings
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this.zoomSpeed = 0.1;
    }

    // Moves camera to target position and smoothly interpolates zoom level
    follow(target) {
        this.x = target.x;
        this.y = target.y;
        // Gradually adjusts current zoom towards target zoom
        this.zoom += (this.targetZoom - this.zoom) * this.zoomSpeed;
    }
}

window.Camera = Camera;
