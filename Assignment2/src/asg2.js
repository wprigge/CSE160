// Vertex shader
const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
`;

// Fragment shader
const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

let canvas, gl;
let a_Position, u_FragColor;
let u_ModelMatrix;
let g_globalAngle=0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_mouseDragging = false;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_regularAnim = false;
let g_leftLegsAngle1 = 0;
let g_rightLegsAngle1 = 0;
let g_leftLegsAngle2 = 0;
let g_rightLegsAngle2 = 0;
let g_extraAnim = false;
let g_headRotation = 0;
let g_legRotationOverride = false;
let g_legOverrideTimeout = null;
let g_hoofRotationOverride = false;
let g_hoofOverrideTimeout = null;
let g_hoofRotationAngle = 0;


function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get WebGL context.');
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');


    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed to get u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log('Failed to get u_GlobalRotateMatrix');
        return;
    }

    if (a_Position < 0 || !u_FragColor) {
        console.log('Failed to get storage location of shader variables.');
    }

    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
    document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('regularAnimOn').onclick = function() {g_regularAnim = true;};
    document.getElementById('regularAnimOff').onclick = function() {g_regularAnim = false;};
    
    document.getElementById('legSlider').addEventListener('input', function() {
        g_legRotationOverride = true;
        g_rightLegsAngle1 = this.value;
        g_leftLegsAngle1 = this.value;
    
        if (g_legOverrideTimeout) clearTimeout(g_legOverrideTimeout);
        g_legOverrideTimeout = setTimeout(() => {
            g_legRotationOverride = false;
        }, 1500); 
    
        renderAllShapes();
    });

    document.getElementById('hoofSlider').addEventListener('input', function() {
        g_hoofRotationAngle = this.value;
        g_hoofRotationOverride = true;
    
        if (g_hoofOverrideTimeout) clearTimeout(g_hoofOverrideTimeout);
        g_hoofOverrideTimeout = setTimeout(() => {
            g_hoofRotationOverride = false;
        }, 1500); 
    
        renderAllShapes();
    });

    document.getElementById('angleSlider').addEventListener('input', function() { g_globalAngleY = parseFloat(this.value); renderAllShapes();});
}


function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    canvas.onmousedown = click;
    canvas.onmouseup = function(ev) {
        g_mouseDragging = false;
    };
    
    canvas.onmousemove = function(ev) {
        if (g_mouseDragging) {
            let deltaX = ev.clientX - g_lastMouseX;
            let deltaY = ev.clientY - g_lastMouseY;
    
            g_globalAngleY += deltaX * 0.5;
            g_globalAngleX += deltaY * 0.5;
    
            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;
    
            renderAllShapes(); 
        }
    };
    

    gl.clearColor(1, 0.8, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    requestAnimationFrame(tick);
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    g_seconds = performance.now()/1000.0-g_startTime;
    //console.log(g_seconds);
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
    let rect = ev.target.getBoundingClientRect();
    let x = (ev.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
    return [x, y];
}

function click(ev){
    if(ev.shiftKey){
        if(g_extraAnim){
            g_headRotation = 0;
        }
        g_extraAnim = !g_extraAnim;
        
    } else {
        g_mouseDragging = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    }
}

function updateAnimationAngles(){

    if(g_extraAnim){
        g_leftLegsAngle1 = (30*Math.sin(5*g_seconds));
        g_rightLegsAngle1 = (30*Math.sin(5*g_seconds));
        g_leftLegsAngle2 = -(30*Math.sin(5*(g_seconds)));
        g_rightLegsAngle2 = -(30*Math.sin(5*(g_seconds)));
        g_headRotation = 30;
        return;
    } 
    
    if (g_regularAnim) {
        if (!g_legRotationOverride && !g_hoofRotationOverride) {
            g_leftLegsAngle1 = 15 * Math.sin(1.5 * g_seconds);
            g_rightLegsAngle1 = -15 * Math.sin(1.5 * g_seconds);
        }

        g_leftLegsAngle2 = 15 * Math.sin(1.5 * g_seconds);
        g_rightLegsAngle2 = -15 * Math.sin(1.5 * g_seconds);

        if(!g_hoofRotationOverride){
            g_hoofRotationAngle=0;
        }
        g_headRotation = 5 * Math.sin(1.5 * g_seconds);

    }
}

function renderAllShapes() {
    let startTime = performance.now();
    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    let body = new Matrix4();
    body.translate(-0.2, -0.3, 0);
    body.scale(1.05, 0.75, 0.7);
    makeCube(body, [110,110,110]);
    

    let head1 = new Matrix4();
    head1.translate(-0.18, 0.05, 0);
    head1.rotate(g_headRotation, 0, 0, 1);
    let tempHead1 = new Matrix4(head1);
    head1.translate(-0.27, -0.25, 0.075)
    head1.scale(0.4, 0.5, 0.55);
    makeCube(head1, [128,128,128]);

    let head2 = new Matrix4();
    let tempHead2 = new Matrix4(tempHead1);
    head2 = tempHead2;
    head2.translate(-0.37, -0.25, 0.1);
    head2.scale(0.1, 0.35, 0.5);
    makeCube(head2, [128,128,128]);

    let head3 = new Matrix4();
    let tempHead3 = new Matrix4(tempHead1);
    head3 = tempHead3;
    head3.translate(-0.67, -0.28, 0.175);
    head3.scale(0.3, 0.25, 0.35);
    makeCube(head3, [128,128,128]);

    let eye = new Matrix4();
    let tempHead4 = new Matrix4(tempHead1);
    eye = tempHead4;
    eye.translate(-0.2701,0,0.074);
    eye.scale(0.1, 0.1, 0.56);
    if(g_extraAnim){
        makeCube(eye, [204,0,0]);
    } else {
        makeCube(eye, [0,0,0]);
    }

    let nose = new Matrix4();
    let tempHead5 = new Matrix4(tempHead1);
    nose = tempHead5;
    nose.translate(-0.62, -0.21, 0.174);
    nose.scale(0.08, 0.08, 0.353);
    makeCube(nose, [170,170,170]);
    
    let leftEar = new Matrix4();
    let tempHead6 = new Matrix4(tempHead1);
    leftEar = tempHead6;
    leftEar.translate(-0.17, 0.25, -0.0);
    leftEar.scale(0.1, 0.2, 0.2);
    makeCube(leftEar, [80,80,80]);

    let rightEar = new Matrix4();
    let tempHead7 = new Matrix4(tempHead1);
    rightEar = tempHead7;
    rightEar.translate(-0.17, 0.25, 0.5);
    rightEar.scale(0.1, 0.2, 0.2);
    makeCube(rightEar, [80,80,80]);

    let bigHorn = new Cone();
    bigHorn.radius = 0.09;
    bigHorn.height = 0.35;
    let tempHead8 = new Matrix4(tempHead1);
    bigHorn.matrix = tempHead8;
    bigHorn.matrix.translate(-0.56, -0.04, 0.35);
    bigHorn.render();

    let smallHorn = new Cone();
    smallHorn.radius = 0.04;
    smallHorn.height = 0.1;
    let tempHead9 = new Matrix4(tempHead1);
    smallHorn.matrix = tempHead9;
    smallHorn.matrix.translate(-0.425, -0.04, 0.35);
    smallHorn.render();

    let FLleg1 = new Matrix4();
    FLleg1.translate(-0.025, -0.3, 0);
    FLleg1.rotate(g_leftLegsAngle1, 0, 0, 1);
    let tempFLleg1 = new Matrix4(FLleg1);
    FLleg1.translate(-0.25/2, -0.35, 0.001);
    FLleg1.scale(0.25, 0.5, 0.2);
    makeCube(FLleg1, [128,128,128]);


    let FLleg2 = new Matrix4();
    FLleg2 = tempFLleg1;
    FLleg2.translate(-0.025, -0.3, 0)
    FLleg2.rotate(g_hoofRotationAngle, 0, 0, 1);
    FLleg2.translate(-0.1, -0.2, 0);
    FLleg2.scale(0.25, 0.15, 0.2);
    makeCube(FLleg2, [96,96,96]);
    
    let BLleg1 = new Matrix4();
    BLleg1.translate(0.625, -0.3, 0);
    BLleg1.rotate(g_leftLegsAngle2, 0, 0, 1);
    let tempBLleg1 = new Matrix4(BLleg1);
    BLleg1.translate(-0.25/2, -0.35, 0.001);
    BLleg1.scale(0.25, 0.5, 0.2);
    makeCube(BLleg1, [128,128,128]);

    
    let BLleg2 = new Matrix4();
    BLleg2 = tempBLleg1;
    BLleg2.translate(-0.25/2, -0.5, 0);
    BLleg2.scale(0.25, 0.15, 0.2);
    makeCube(BLleg2, [96,96,96]);
    

    let FRleg1 = new Matrix4();
    FRleg1.translate(-0.025, -0.3, 0);
    FRleg1.rotate(g_rightLegsAngle1, 0, 0, 1);
    let tempFRleg1 = new Matrix4(FRleg1);
    FRleg1.translate(-0.25/2, -0.35, 0.499);
    FRleg1.scale(0.25, 0.5, 0.2);
    makeCube(FRleg1, [128,128,128]);

    let FRleg2 = new Matrix4();
    FRleg2 = tempFRleg1;
    FRleg2.translate(-0.025, -0.3, 0)
    FRleg2.rotate(g_hoofRotationAngle, 0, 0, 1);
    FRleg2.translate(-0.1, -0.2, 0.5);
    FRleg2.scale(0.25, 0.15, 0.2);
    makeCube(FRleg2, [96,96,96]);

    let BRleg1 = new Matrix4();
    BRleg1.translate(0.625, -0.3, 0);
    BRleg1.rotate(g_rightLegsAngle2, 0, 0, 1);
    let tempBRleg1 = new Matrix4(BRleg1);
    BRleg1.translate(-0.25/2, -0.35, 0.499);
    BRleg1.scale(0.25, 0.5, 0.2);
    makeCube(BRleg1, [128,128,128]);

    
    let BRleg2 = new Matrix4();
    BRleg2 = tempBRleg1;
    BRleg2.translate(-0.25/2, -0.5, 0.5);
    BRleg2.scale(0.25, 0.15, 0.2);
    makeCube(BRleg2, [96,96,96]);

    let tail = new Matrix4();
    tail.rotate(45, 0, 0, 1);
    tail.translate(0.75, -0.6, 0.3);
    tail.scale(0.1, 0.25, 0.1);
    makeCube(tail, [150, 150, 150]);
    

    let duration = performance.now() - startTime;
    sendTextToHTML('ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(1000 / duration));

}

function sendTextToHTML(text, elementID = 'fpsText') {
    let element = document.getElementById(elementID);
    if (element) {
        element.innerHTML = text;
    }
}

function makeCube(M, color){
    let c = new Cube();
    c.color = [color[0]/255, color[1]/255, color[2]/255, 1];
    c.matrix = M;
    c.render();
}