
const VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
`;


const FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {
        if(u_whichTexture == -2){
            gl_FragColor = u_FragColor;
        } else if(u_whichTexture == -1){
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if(u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if(u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV * 40.0);
        } else {
            gl_FragColor = vec4(1,.2,.2,1);
        }
    }
`;

let canvas, gl;
let a_Position, u_FragColor;
let a_UV;
let u_ModelMatrix, u_GlobalRotateMatrix;
let g_globalAngleY = 0;
let u_ViewMatrix, u_ProjectionMatrix;
let u_Sampler0, u_Sampler1;
let u_whichTexture=0;
let isMouseDown=false;
let lastMouseX=null;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Shader init failed');
        return;
    }
    
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

    gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);
}

function addActionsForHtmlUI() {

}

function initTextures(){
    let image0 = new Image();
    let image1 = new Image();
    if(!image0 || !image1){
        console.log('bad image');
        return;
    }
    image0.onload = function(){ sendImageToTexture0(image0, 0, u_Sampler0); renderAllShapes();};
    image1.onload = function(){ sendImageToTexture0(image1, 1, u_Sampler1); renderAllShapes();};

    image0.src = 'brick6.jpg';
    image1.src = 'grass1.jpg';
    return true;
}

function sendImageToTexture0(image, texUnit, samplerUniform){
    let texture = gl.createTexture();
    if(!texture){
        console.log('no texture');
        return;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D); 

    gl.uniform1i(samplerUniform, texUnit);

    console.log('finished loadTexture0');
}



function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    document.onkeydown = keydown;

    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    renderAllShapes();

    isMouseDown = false;
    let lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });


    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;  
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;

        let deltaX = e.clientX - lastX;
        let deltaY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        g_camera.rotate(deltaX, deltaY);
        renderAllShapes();
    });

}

function keydown(ev) {
    switch (ev.keyCode) {
        case 87: // W
            g_camera.forward();
            break;
        case 83: // S
            g_camera.back();
            break;
        case 65: // A
            g_camera.left();
            break;
        case 68: // D
            g_camera.right();
            break;
        case 81: // Q
            g_camera.panLeft(5);
            break;
        case 69: // E
            g_camera.panRight(5);
            break;
        case 90: // Z 
            addBlockInFront(g_camera);
            break;
        case 67: // C 
            deleteBlockInFront(g_camera);
            break;
    }

    renderAllShapes();
}


let g_map = [
    [4,4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    [4,0,4,0,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,4,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1,2,3,5,5,5,5,5,5,4,3,4,0,0,0,0,4],
    [4,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,4],
    [4,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,4],
    [4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,4],
    [4,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,4],
    [4,0,3,3,3,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,4],
    [4,0,3,3,3,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,23,22,23,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],//front
    [4,0,0,0,0,0,0,0,0,0,11,12,14,22,24,22,14,12,11,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,23,22,23,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4],
    [4,0,0,0,0,1,1,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,4],
    [4,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,4],
    [4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,4,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,5,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,2,2,0,0,0,6,0,0,0,0,4],
    [4,6,8,4,2,3,5,6,1,4,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,7,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,8,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,4],
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
];
  
function drawMap() {
    let nRows = g_map.length;
    for (let x = 0; x < nRows; x++) {
        for (let z = 0; z < g_map[0].length; z++) {
            let value = g_map[x][z];

            if (value >= 1 && value <= 10) {
                for (let y = 0; y < value; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [180, 180, 180], 0); 
                }
            } else if (value >= 11 && value <= 14) {
                let height = value - 10;
                for (let y = 0; y < height; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 0, 0], -2); 
                }
            } else if (value >= 15 && value <= 20) {
                let height = value - 10;
                for (let y = 0; y < height; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

            } else if (value == 22) {
                let height = value - 10;
                for (let y = 0; y < 7; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

                for (let y = 7; y < 8; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [0, 255, 255], -2); 
                }

                for (let y = 8; y < 10; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

                for (let y = 10; y < height; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [0, 0, 0], -2); 
                }
            } else if (value == 23) {
                let height = value - 11;
                for (let y = 0; y < 10; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

                for (let y = 10; y < height; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [0, 0, 0], -2); 
                }
            } else if (value == 24) {
                let height = value - 10;
                for (let y = 0; y < 7; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

                for (let y = 7; y < 8; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [0, 255, 255], -2); 
                }

                for (let y = 8; y < 10; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [255, 255, 255], -2); 
                }

                for (let y = 10; y < height; y++) {
                    let cube = new Matrix4();
                    cube.translate((nRows - 1 - x) - 16, y - 0.25, z - 16);
                    makeCube(cube, [0, 0, 0], -2); 
                }
            } else {

            }
        }
    }
}



function getBlockInFront(camera) {
    const distance = 2;

    const radYaw = camera.yaw * Math.PI / 180;
    const radPitch = camera.pitch * Math.PI / 180;

    const dx = Math.cos(radPitch) * Math.cos(radYaw);
    const dy = Math.sin(radPitch);
    const dz = Math.cos(radPitch) * Math.sin(radYaw);

    const forward = new Vector3([dx, dy, dz]).normalize();
    const targetPos = camera.eye.clone().add(forward.mul(distance));

    
    const mapX = g_map.length - 1 - Math.floor(targetPos.elements[0] + 16); 
    const mapZ = Math.floor(targetPos.elements[2] + 16);                    

    const mapY = Math.floor(targetPos.elements[1]); 

    if (
        mapX < 0 || mapX >= g_map.length ||
        mapZ < 0 || mapZ >= g_map[0].length
    ) {
        return null;
    }

    return {
        x: mapX,
        z: mapZ,
        height: g_map[mapX][mapZ],
        y: mapY
    };
}



function addBlockInFront(camera) {
    let block = getBlockInFront(camera);  
    if (!block) return;

    if (g_map[block.x][block.z] < 24) {
        g_map[block.x][block.z] += 1;
    } else {
        console.log("Maximum block height reached at this location.");
    }
}


function deleteBlockInFront(camera) {
    let block = getBlockInFront(camera);
    if (block && g_map[block.x][block.z] > 0) {
        g_map[block.x][block.z] -= 1;
    }
}



g_camera = new Camera();

function renderAllShapes() {
    let projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    let viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
    );
    
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let floor = new Matrix4();
    floor.translate(0,-0.25, 0.0);
    floor.scale(40,0.01,40);
    floor.translate(-0.5, 0, -0.5);
    makeCube(floor, [153, 255, 153], 1);

    let sky = new Matrix4();
    sky.scale(100,100,100);
    sky.translate(-0.5, -0.5, -0.5);
    makeCube(sky, [0,160,255], -2);

    drawMap();
}


function makeCube(M, color, textureNum = 0) {
    let c = new Cube();
    c.color = [color[0] / 255, color[1] / 255, color[2] / 255, 1];
    c.matrix = M;
    c.textureNum = textureNum;
    c.renderFast();
}

