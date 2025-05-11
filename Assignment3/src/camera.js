class Camera{
    
    constructor(){
        this.eye = new Vector3([0,0.5,14]);
        this.at = new Vector3([0,0.5,0]);
        this.up = new Vector3([0,1,0]);
        this.pitch = 0; 
        this.yaw = -90; 
    }

    forward() {
        let f = this.at.clone().sub(this.eye).normalize().mul(0.5);
        let newEye = this.eye.clone().add(f);
        let newAt = this.at.clone().add(f);
    
        this.eye = newEye;
        this.at = newAt;
    
    }

    back() {
        let f = this.at.clone().sub(this.eye).normalize().mul(0.5);  
        this.eye.sub(f);  
        this.at.sub(f);
    }
    
    left() {
        let f = this.at.clone().sub(this.eye).normalize();
        f.elements[1] = 0; 
        let s = Vector3.cross(this.up.clone(), f).normalize().mul(0.5);
        this.eye.add(s);
        this.at.add(s);
    }

    right() {
        let f = this.at.clone().sub(this.eye).normalize();
        f.elements[1] = 0; 
        let s = Vector3.cross(this.up.clone(), f).normalize().mul(0.5);
        this.eye.sub(s);
        this.at.sub(s);
    }
    
    panLeft(angleDegrees) {
        let f = this.at.clone().sub(this.eye); 
        let rotation = new Matrix4().setRotate(angleDegrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let rotated = rotation.multiplyVector3(f);
        this.at = this.eye.clone().add(rotated);
    
        const dir = rotated.normalize();
        this.yaw = Math.atan2(dir.elements[2], dir.elements[0]) * 180 / Math.PI;
        this.pitch = Math.asin(dir.elements[1]) * 180 / Math.PI;
    }
    
    
    panRight(angleDegrees) {
        this.panLeft(-angleDegrees);
    }

    rotate(deltaX, deltaY) {
        const sensitivity = 0.2; 
    
        this.yaw += deltaX * sensitivity;
        this.pitch -= deltaY * sensitivity;
    
        if (this.pitch > 89) this.pitch = 89;
        if (this.pitch < -89) this.pitch = -89;
    
        const radYaw = this.yaw * Math.PI / 180;
        const radPitch = this.pitch * Math.PI / 180;
    
        const x = Math.cos(radPitch) * Math.cos(radYaw);
        const y = Math.sin(radPitch);
        const z = Math.cos(radPitch) * Math.sin(radYaw);
    
        const forward = new Vector3([x, y, z]).normalize();
        this.at = this.eye.clone().add(forward);
    }
    
  
}