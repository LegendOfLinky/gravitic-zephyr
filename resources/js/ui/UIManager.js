// In UIManager.js
class UIManager {
    static updateOrbitalVelocity(value) {
        document.getElementById('orbitalVelocity').textContent = value.toFixed(2);
    }
    static updateSurfaceVelocity(value) {
        document.getElementById('surfaceVelocity').textContent = value.toFixed(2);
    }
    static updateAltitude(value) {
        document.getElementById('altitude').textContent = value.toFixed(2);
    }
    static updateOrbitalPeriod(value) {
        document.getElementById('orbitalPeriod').textContent = value.toFixed(1);
    }
    static updateTimeWarp(value) {
        document.getElementById('timeWarp').textContent = value.toFixed(2) + 'x';
    }
    static updateStatus(text) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = text;
        // Optional: Add visual feedback for pause state
        if (text === 'Paused') {
            statusElement.style.color = '#ff9900';  // Orange color for paused state
        } else {
            statusElement.style.color = '';  // Reset to default color
        }
    }
}

window.UIManager = UIManager;
