class Cone {
    constructor() {
        this.type = 'cone';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 36;
        this.radius = 0.2;
        this.height = 0.4;
        this.matrix = new Matrix4(); 
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const x=0, y=0,z=0;
        const angleStep = 360 / this.segments;

        for (let angle = 0; angle < 360; angle += angleStep) {
            const angle1 = angle * Math.PI / 180;
            const angle2 = (angle + angleStep) * Math.PI / 180;

            const x1 = x + this.radius * Math.cos(angle1);
            const z1 = z + this.radius * Math.sin(angle1);

            const x2 = x + this.radius * Math.cos(angle2);
            const z2 = z + this.radius * Math.sin(angle2);

            const apex = [x, y + this.height, z];

            drawTriangle3D([x1,y,z1, x2,y,z2, apex[0],apex[1], apex[2]]);
        }
    }
}
