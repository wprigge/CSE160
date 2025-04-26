class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        let rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // FRONT face 
        drawTriangle3D([0,0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0,0, 0, 0, 1, 0, 1, 1, 0]);

        // TOP face 
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

        
        // BACK face 
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D([1, 0, 1, 1, 1, 1, 0, 0, 1]);
        drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);
        
        // BOTTOM face 
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
        drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);

        // LEFT face 
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);
        drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);

        // RIGHT face 
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 0, 1]);
        drawTriangle3D([1, 0, 1, 1, 1, 0, 1, 1, 1]);
    }
}
