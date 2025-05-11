/**
 * This is a class treating 4x4 matrix.
 * This class contains the function that is equivalent to OpenGL matrix stack.
 * The matrix after conversion is calculated by multiplying a conversion matrix from the right.
 * The matrix is replaced by the calculated result.
 */

class Vector3 {
    constructor(opt_src) {
        var v = new Float32Array(3);
        if (opt_src && typeof opt_src === 'object') {
          v[0] = opt_src[0];
          v[1] = opt_src[1];
          v[2] = opt_src[2];
        }
        this.elements = v;
    }

    /**
     * Copy vector.
     * @param src source vector
     * @return this
     */
    set(src) {
        var i, s, d;

        s = src.elements;
        d = this.elements;

        if (s === d) {
          return;
        }

        for (i = 0; i < 3; ++i) {
          d[i] = s[i];
        }

        return this;
    }

    /**
      * Add other to this vector.
      * @return this
      */
    add(other) {
        // Insert your code here.
        // This function should change this vector (this.elements) and not create a new vector.

        // Don't delete the return statement.

        this.elements[0] += other.elements[0];
        this.elements[1] += other.elements[1];
        this.elements[2] += other.elements[2];

        return this;
    };

    /**
      * Subtract other from this vector.
      * @return this
      */
    sub(other) {
        // Insert your code here.
        // This function should change this vector (this.elements) and not create a new vector.

        // Don't delete the return statement.

        this.elements[0] -= other.elements[0];
        this.elements[1] -= other.elements[1];
        this.elements[2] -= other.elements[2];
        return this;
    };

    /**
      * Divide this vector by a scalar.
      * @return this
      */
    div(scalar) {
        // Insert your code here.
        // This function should change this vector (this.elements) and not create a new vector.

        // Don't delete the return statement.
        this.elements[0] /= scalar;
        this.elements[1] /= scalar;
        this.elements[2] /= scalar;
        return this;
    };

    /**
      * Multiply this vector by a scalar.
      * @return this
      */
    mul(scalar) {
        // Insert your code here.
        // This function should change this vector (this.elements) and not create a new vector.

        // Don't delete the return statement.
        this.elements[0] *= scalar;
        this.elements[1] *= scalar;
        this.elements[2] *= scalar;
        
        return this;
    };

    /**
      * Calcualte the dop product between this vector and other.
      * @return scalar
      */
    static dot(other1, other2) {
        // Insert your code here.

        let d = other1.elements[0] * other2.elements[0] + other1.elements[1] * other2.elements[1] + other1.elements[2] * other2.elements[2]; // Modify this line to calculate this vector's magnitude.

        // Don't delete the return statement.
        return d;
    }

    /**
      * Calcualte the cross product between this vector and other.
      * @return new vector
      */
    static cross(other1, other2) {
        let x = other1.elements[1] * other2.elements[2] - other1.elements[2] * other2.elements[1];
        let y = other1.elements[2] * other2.elements[0] - other1.elements[0] * other2.elements[2];
        let z = other1.elements[0] * other2.elements[1] - other1.elements[1] * other2.elements[0];

        // Insert your code here.
        // This function should create and return a new vector.
        let v3 = new Vector3([x,y,z]); // Modify this line to calculate cross product between other1 and other2.

        // Don't delete the return statement.
        return v3;
    }

    /**
      * Calculate the magnitude (or length) of this vector.
      * @return scalar
      */
    magnitude() {
        // Insert your code here.
        let x = this.elements[0];
        let y = this.elements[1];
        let z = this.elements[2];

        let m = Math.sqrt(x*x + y*y + z*z); // Modify this line to calculate this vector's magnitude.
        
        // Don't delete the return statement.
        return m;
    };

    /**
      * Normalize this vector.
      * @return this
      */
    normalize() {
        // Insert your code here.
        // This function should change this vector (this.elements) and not create a new vector.

        // Don't delete the return statement.
        let mag = this.magnitude();
        if(mag != 0){
          this.elements[0] /= mag;
          this.elements[1] /= mag;
          this.elements[2] /= mag;
        }
        
        return this;
    };

    clone(){
      return new Vector3(this.elements);
    }
}

class Vector4 {
    /**
     * Constructor of Vector4
     * If opt_src is specified, new vector is initialized by opt_src.
     * @param opt_src source vector(option)
     */
    constructor(opt_src) {
        var v = new Float32Array(4);
        if (opt_src && typeof opt_src === 'object') {
          v[0] = opt_src[0];
          v[1] = opt_src[1];
          v[2] = opt_src[2];
          v[3] = opt_src[3];
        }
        this.elements = v;
    }
}

