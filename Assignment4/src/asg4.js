// Vertex Shader
const VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }
`;

// Fragment Shader

const FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform vec3 u_lightPos;
    uniform int u_whichTexture;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    uniform bool u_spotlightOn;
    uniform vec3 u_spotlightPos;
    uniform vec3 u_spotlightDir;
    uniform float u_spotlightCutoff; 
    uniform vec3 u_lightColor;


    void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        } else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }

        vec3 lightVector = u_lightPos - vec3(v_VertPos);
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N, L), 0.0);

        vec3 R = reflect(-L, N);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

        float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

        vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * 0.8;
        vec3 ambient = vec3(gl_FragColor) * 0.3;
        
        
        vec3 spotDir = normalize(u_spotlightDir);
        vec3 fragToLight = normalize(u_spotlightPos - vec3(v_VertPos));  
        float theta = dot(spotDir, fragToLight);  

        float spotlightIntensity = 1.0;
        if (u_spotlightOn) {
            float innerCutoff = u_spotlightCutoff;
            float outerCutoff = innerCutoff - 0.1;
            spotlightIntensity = smoothstep(outerCutoff, innerCutoff, theta);
        }

        if (u_lightOn) {
            if(u_spotlightOn){
                specular = 0.0;
            }
            vec3 lighting = ambient + spotlightIntensity * (diffuse + specular);
            gl_FragColor = vec4(lighting, 1.0);
        } else {
            gl_FragColor = vec4(gl_FragColor.rgb, 1.0);  // No lighting, just color
        }

    }
`;

let canvas, gl;
let a_Position, a_UV, a_Normal;
let u_FragColor, u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_Sampler0, u_whichTexture, u_lightPos, u_cameraPos, u_lightOn;
let u_spotlightPos, u_spotlightDir, u_spotlightCutoff, u_spotlightOn;
let g_camera = new Camera();
let g_globalAngle = 180;
let g_normalOn = false;
let g_lightMoving = false;
let g_lightOn = true;
let g_spotlightOn=false;
let g_lightPos= [0,2.4,0];
let g_lightMoveArr = [0,0,0];
let u_lightColor;
let g_lightColor = [1.0, 1.0, 1.0]; 



function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
    u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
    u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
    u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');



}

function initTextures() {
    let image = new Image();
    image.onload = function () {
        let texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(u_Sampler0, 0);
        renderAllShapes();
    };
    image.src = 'brick6.jpg';
}


function addActionsForHtmlUI() {
    
    const slider = document.getElementById('angleSlider');

    slider.value = g_globalAngle;
    g_camera.rotateAroundTarget(g_globalAngle);  

    slider.addEventListener('input', function () {
        g_globalAngle = parseFloat(this.value);
        g_camera.rotateAroundTarget(g_globalAngle);
        renderAllShapes();
    });

    document.getElementById('normalAnimOn').onclick = function() {g_normalOn=true; renderAllShapes();};
    document.getElementById('normalAnimOff').onclick = function() {g_normalOn=false; renderAllShapes();};

    document.getElementById('lightAnimOn').onclick = function() {g_lightMoving=true; renderAllShapes();};
    document.getElementById('lightAnimOff').onclick = function() {g_lightMoving=false; renderAllShapes();};

    document.getElementById('lightOn').onclick = function() {g_lightOn=true;renderAllShapes();};
    document.getElementById('lightOff').onclick = function() {g_lightOn=false; renderAllShapes();};

    document.getElementById('spotlightOn').onclick = function() {g_spotlightOn=true;  g_lightPos = [0, 2.4, 0]; g_lightMoving = false; renderAllShapes();};
    document.getElementById('spotlightOff').onclick = function() {g_spotlightOn=false; renderAllShapes();};

    document.getElementById('lightSliderX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[0] = -this.value/100; g_lightMoving=false; renderAllShapes();}});
    document.getElementById('lightSliderY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value/100; g_lightMoving=false; renderAllShapes();}});
    document.getElementById('lightSliderZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value/100; g_lightMoving=false; renderAllShapes();}});

    document.getElementById('lightR').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[0] = this.value/255; renderAllShapes();}});
    document.getElementById('lightG').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[1] = this.value/255; renderAllShapes();}});
    document.getElementById('lightB').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[2] = this.value/255; renderAllShapes();}});
    
    
}


function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    initTextures();

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    renderAllShapes();
    tick();
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    let projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    let spotlightPos = new Vector3([0.0, 3.0, 0.0]);      
    let spotlightTarget = new Vector3([0.0, 20.0, -1.0]); 
    //let spotlightPos = new Vector3([0.0, 2, 0.0]); 
    //let spotlightTarget = new Vector3([0.0, -1.0, -1.0]); 
    let spotlightDir = spotlightTarget.sub(spotlightPos).normalize();
    let spotlightCutoff = Math.cos((20 * Math.PI) / 180);  

    gl.uniform3f(u_spotlightPos, spotlightPos.elements[0], spotlightPos.elements[1],spotlightPos.elements[2]);
    gl.uniform3f(u_spotlightDir, spotlightDir.elements[0], spotlightDir.elements[1],spotlightDir.elements[2]);
    gl.uniform1f(u_spotlightCutoff, spotlightCutoff);
    gl.uniform1i(u_spotlightOn, g_spotlightOn);
    gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

    
    let skybox = new Cube();
    skybox.color = [0 / 255, 160 / 255, 255 / 255, 1];
    skybox.textureNum = -2;
    if(g_normalOn) skybox.textureNum = -3;
    skybox.matrix.translate(0, 2.5, 0);
    skybox.matrix.scale(-10, 10, 10);
    skybox.matrix.translate(-0.5, -0.5, -0.5);
    gl.depthMask(false);
    skybox.render();
    gl.depthMask(true);

    let floor = new Cube();
    floor.color = [153 / 255, 255 / 255, 153 / 255, 1];
    floor.textureNum = -2;
    floor.matrix = new Matrix4();
    floor.matrix.translate(0, -1, 0);
    floor.matrix.scale(40, 0.01, 40);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    let lightX = g_lightMoving ? Math.sin(g_seconds) * 1.5 : g_lightPos[0];
    let lightY = g_lightPos[1];  
    let lightZ = g_lightPos[2];  
    gl.uniform3f(u_lightPos, lightX, lightY, lightZ);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    let light = new Cube();
    light.color = [2, 2, 0, 1]; 
    light.textureNum = -2;

    light.matrix.translate(lightX, lightY, lightZ);
    light.matrix.translate(0.05, -0.05, -0.05);
    light.matrix.scale(-0.1, -0.1, 0.1);
    light.render();

    let sphere = new Sphere();
    sphere.textureNum = -2;
    if(g_normalOn) sphere.textureNum = -3;
    sphere.matrix.translate(0,0.5,0);
    sphere.matrix.scale(0.5,0.5,0.5);
    gl.uniformMatrix4fv(u_ModelMatrix, false, sphere.matrix.elements);
    sphere.render();

}
let g_startTime = performance.now()/1000;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    let now = performance.now();
    g_seconds = (now - g_startTime) / 1000.0;  

    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}


function updateAnimationAngles(){
   
}


