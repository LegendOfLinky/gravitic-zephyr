// Config.js
const Config = {
    // Physics constants
    PHYSICS: {
        TIME_WARP_MIN: 0.25,         // Minimum time acceleration
        TIME_WARP_MAX: 16.0,         // Maximum time acceleration

        GRAVITY_CONSTANT: 0.01       // Scale factor for gravity (from OrbitPredictor)
    },

    SPACECRAFT: {
        THRUST_POWER: 0.001,         // Engine power (from Spacecraft)
        ROTATION_SPEED: 0.03,        // Turn rate (from Spacecraft)
    },

    // Orbit prediction settings
    PREDICTION: {
        QUALITY: 2000,              // Points per orbit (from OrbitPredictor)
        TARGET_ORBITS: 5,           // Number of orbits to predict
        MIN_OPACITY: 0.2            // Minimum opacity for distant predictions
    },

    CELESTIAL: {
        SUN: {
            id: "SUN",
            x: 0,
            y: 0,
            mass: 8000,
            radius: 120,
            soiScale: 20,
            color: '#fff06b',
            isVisible: true,
            isOrbiting: false,
            orbitalHeight: 0,
            orbitalSpeed: 0,
            orbitalPhase: 0
        },

        EARTH: {
            id: "EARTH",
            x: 0,    // Will use Sun's position as orbit center
            y: 0,    // Will use Sun's position as orbit center
            mass: 2000,
            radius: 40,
            soiScale: 8,
            color: '#4ecdc4',
            isVisible: true,
            isOrbiting: true,
            orbitalHeight: 1600,
            orbitalSpeed: 0.00005,
            orbitalPhase: 0
        },

        MOON: {
            id: "MOON",
            x: 0,    // Will use Earth's position as orbit center
            y: 0,    // Will use Earth's position as orbit center
            mass: 500,
            radius: 15,
            soiScale: 4,
            color: '#95a5a6',
            isVisible: true,
            isOrbiting: true,
            orbitalHeight: 400,
            orbitalSpeed: 0.0002,
            orbitalPhase: Math.PI / 4  // Start at 45 degrees
        }
    },

    // Rendering settings
    RENDER: {
        STAR_COUNT: 800,           // Number of background stars
        PARTICLE_LIFE: 15,         // Lifetime of thrust particles
        PARTICLE_COUNT: 12         // Maximum particles per thrust
    }
};

window.Config = Config;
