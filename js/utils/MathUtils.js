// Defines a utility object for math operations
const MathUtils = {
    // 2D Vector class for handling coordinate operations
    Vector2: class Vector2 {
        // Creates a new vector with optional x,y coordinates defaulting to 0
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        // Returns a new vector that is the sum of this vector and vector v
        add(v) {
            return new Vector2(this.x + v.x, this.y + v.y);
        }

        // Returns a new vector that is the difference of this vector and vector v
        subtract(v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        }

        // Returns a new vector that is this vector multiplied by a scalar value
        multiply(scalar) {
            return new Vector2(this.x * scalar, this.y * scalar);
        }

        // Calculates the length (magnitude) of this vector using Pythagorean theorem
        magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        // Returns a new vector in the same direction but with magnitude of 1
        normalize() {
            const mag = this.magnitude();
            // If magnitude is 0, return zero vector to avoid division by zero
            if (mag === 0) {
                return new Vector2();
            }
            
            return this.multiply(1 / mag);
        }
    }
};

window.MathUtils = MathUtils;
