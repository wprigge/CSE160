class Triangle{
    constructor(){
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render(){
        let xy = this.position;
        let rgba = this.color;
        let size = this.size;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        
        let d = this.size/200.0;
        let halfBase = d;
        let height = d * Math.sqrt(3);
        drawTriangle([xy[0]-halfBase, xy[1], xy[0]+halfBase, xy[1], xy[0], xy[1]+height]);
    }
}

class CustomTriangle {
    constructor(v1x, v1y, v2x, v2y, v3x, v3y, color) {
        this.type = 'custom_triangle';
        this.vertices = [v1x, v1y, v2x, v2y, v3x, v3y];  
        this.color = [color[0], color[1], color[2], 1.0]; 
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        drawTriangle(this.vertices);
    }
}


function drawTriangle(vertices){
    let n = 3;
    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create buffer');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}



