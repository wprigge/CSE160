class Camera{
    
    constructor(){
        this.eye = new Vector3([0, 0.5, -4]);   
        this.at  = new Vector3([0, 0.5, 0]);    
   
        this.up = new Vector3([0,1,0]);
        this.pitch = 0; 
        this.yaw = -90; 
    }

    rotateAroundTarget(angleDeg) {
        const rad = angleDeg * Math.PI / 180;
        const radius = this.eye.clone().sub(this.at).magnitude(); 
        const y = this.eye.elements[1]; 

        const newX = this.at.elements[0] + radius * Math.sin(rad);
        const newZ = this.at.elements[2] + radius * Math.cos(rad);

        this.eye.elements[0] = newX;
        this.eye.elements[2] = newZ;
        this.eye.elements[1] = y; 

        const forward = this.at.clone().sub(this.eye).normalize();
        this.yaw = Math.atan2(forward.elements[2], forward.elements[0]) * 180 / Math.PI;
        this.pitch = Math.asin(forward.elements[1]) * 180 / Math.PI;
    }

  
}