
function cos(x){
    return Math.cos(x);
}

function sin(x){
    return Math.sin(x);
}

class Sphere{
    constructor(){
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts32 = new Float32Array([]);
    }

    render(){
        let rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI/25;
        let dd = Math.PI/25;

        for (let t=0; t<Math.PI; t+=d){
            for(let r=0; r<(2*Math.PI); r+=d){
                let p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];
                let p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
                let p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
                let p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

                let uv1 = [t/Math.PI, r/(2*Math.PI)];
                let uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                let uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                let uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                let v = [];
                let uv = [];
                v=v.concat(p1); uv = uv.concat(uv1);
                v=v.concat(p2); uv = uv.concat(uv2);
                v=v.concat(p4); uv = uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

                v=[]; uv=[];
                v=v.concat(p1); uv = uv.concat(uv1);
                v=v.concat(p4); uv = uv.concat(uv4);
                v=v.concat(p3); uv = uv.concat(uv3);
                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

            }
        }
    }
}