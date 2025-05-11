class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }

    render() {
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // FRONT face
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
    
        // TOP face
        //gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

    
        // BACK face
        //gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,1,1, 0,1,1, 1,0,1], [0,1, 1,1, 0,0]);
        drawTriangle3DUV([0,0,1, 0,1,1, 1,0,1], [1,0, 1,1, 0,0]);
    
        // BOTTOM face
        //gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 0,1]);
    
        // LEFT face
        //gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1]);
    
        // RIGHT face
        //gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,0,0, 1,1,0, 1,0,1], [0,0, 0,1, 1,0]);
        drawTriangle3DUV([1,0,1, 1,1,0, 1,1,1], [1,0, 0,1, 1,1]);
    }

    renderFast() {
        let rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        let allVerts =[];
        let allUVs = [];

        //FRONT
        allVerts = allVerts.concat([0,0,0, 1,1,0, 1,0,0]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);
        allVerts = allVerts.concat([0,0,0, 0,1,0, 1,1,0]);
        allUVs = allUVs.concat([0,0, 0,1, 1,1]);

        //TOP
        allVerts = allVerts.concat([0,1,0, 0,1,1, 1,1,1]);
        allUVs = allUVs.concat([0,0, 0,1, 1,1]);
        allVerts = allVerts.concat([0,1,0, 1,1,1, 1,1,0]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);

        //BACK
        allVerts = allVerts.concat([1,1,1, 0,1,1, 1,0,1]);
        allUVs = allUVs.concat([0,1, 1,1, 0,0]);
        allVerts = allVerts.concat([0,0,1, 0,1,1, 1,0,1]);
        allUVs = allUVs.concat([1,0, 1,1, 0,0]);

        //BOTTOM
        allVerts = allVerts.concat([0,0,0, 1,0,0, 1,0,1]);
        allUVs = allUVs.concat([0,0, 1,0, 1,1]);
        allVerts = allVerts.concat([0,0,0, 1,0,1, 0,0,1]);
        allUVs = allUVs.concat([0,0, 1,1, 0,1]);

        //LEFT
        allVerts = allVerts.concat([0,0,0, 0,0,1, 0,1,1]);
        allUVs = allUVs.concat([1,0, 0,0, 0,1]);
        allVerts = allVerts.concat([0,0,0, 0,1,1, 0,1,0]);
        allUVs = allUVs.concat([1,0, 0,1, 1,1]);

        //RIGHT
        allVerts = allVerts.concat([1,0,0, 1,1,0, 1,0,1]);
        allUVs = allUVs.concat([0,0, 0,1, 1,0]);
        allVerts = allVerts.concat([1,0,1, 1,1,0, 1,1,1]);
        allUVs = allUVs.concat([1,0, 0,1, 1,1]);

        drawTriangle3DUV(allVerts, allUVs);
    }
    
    
}
