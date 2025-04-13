// Vertex shader program
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`


// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`


let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
    canvas = document.getElementById('webgl');

    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get WebGL context.');
        return;
    }
}

function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log('Failed to get u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size){
        console.log('Failed to get u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 15;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_useRainbow = false;
let g_rainbowHue = 0;
let g_mirrorMode = 'none';

function addActionsForHtmlUI(){
    document.getElementById('clear').onclick = function() {g_shapesList = []; renderAllShapes();};

    document.getElementById('pointsButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('trianglesButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circlesButton').onclick = function() {g_selectedType=CIRCLE};

    document.getElementById('redSlider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById('greenSlider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
    document.getElementById('blueSlider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
    document.getElementById('alphaSlider').addEventListener('mouseup', function() {g_selectedColor[3] = this.value/100;});

    document.getElementById('sizeSlider').addEventListener('mouseup', function() {g_selectedSize = this.value;});
    document.getElementById('segmentSlider').addEventListener('mouseup', function() {g_selectedSegments = this.value;});
    document.getElementById('rainbowToggle').onclick = function () {g_useRainbow = !g_useRainbow};
    document.getElementById('mirrorMode').addEventListener('change', function () {g_mirrorMode = this.value;})
    

    document.getElementById('drawButton').onclick = drawTheImage;
    

}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

    //Color for clearing canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
}

var g_shapesList = [];

function click(ev){
    let [x,y] = convertCoordinatesEventToGL(ev);

    let point;
    if(g_selectedType == POINT){
        point = new Point();
    } else if(g_selectedType==TRIANGLE){
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegments;
    }
    point.position = [x,y];
    point.size = g_selectedSize;

    //Toggle for rainbow brush 
    if (g_useRainbow) {
        g_rainbowHue = (g_rainbowHue + 10) % 360;
        const [r, g, b] = hslToRgb(g_rainbowHue / 360, 1, 0.5);
        point.color = [r, g, b, g_selectedColor[3]]; 
    } else {
        point.color = g_selectedColor.slice(); 
    }

    g_shapesList.push(point);

    //Mirror mode
    const mirrors = [];

    if (g_mirrorMode === "x") mirrors.push([x, -y]);
    if (g_mirrorMode === "y") mirrors.push([-x, y]);
    if (g_mirrorMode === "both") {
        mirrors.push([-x, y]);
        mirrors.push([x, -y]);
        mirrors.push([-x, -y]);
    }

    for (let [mx, my] of mirrors) {
        let mirrored;
        if (g_selectedType == POINT) {
            mirrored = new Point();
        } else if (g_selectedType == TRIANGLE) {
            mirrored = new Triangle();
        } else {
            mirrored = new Circle();
            mirrored.segments = g_selectedSegments;
        }
        mirrored.position = [mx, my];
        mirrored.color = point.color;
        mirrored.size = point.size;
        g_shapesList.push(mirrored);
    }

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    // Store the coordinates to g_points array
    return([x,y]);
}

function renderAllShapes(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let len = g_shapesList.length;
    for(let i = 0; i < len; i++){
        g_shapesList[i].render();
    }
}

//Rainbow brush helper
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; 
    } else {
        const hue2rgb = function (p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}


//Helper functions for custom image
function makeTriangle(x1, y1, x2, y2, x3, y3, color) {
    let normColor = [color[0]/255, color[1]/255, color[2]/255];
    let t = new CustomTriangle(x1/200, y1/200, x2/200, y2/200, x3/200, y3/200, normColor);
    g_shapesList.push(t);
}

function makePoint(x, y, size, color) {
    let p = new Point();
    p.position = [x/200, y/200];
    p.size = size;
    p.color = [color[0]/255, color[1]/255, color[2]/255, 1.0];
    g_shapesList.push(p);  

}

function makeCircle(x, y, size, segments, color) {
    let c = new Circle();
    c.position = [x/200, y/200];
    c.size = size;
    c.segments = segments;
    c.color = [color[0]/255, color[1]/255, color[2]/255, 1.0];
    g_shapesList.push(c);
}


function drawTheImage(){
    makeRocket();
    makeEarth();
    makeStars();
    renderAllShapes();
}

function makeRocket(){
    
    //body
    makeTriangle(-130, 130, -120, 70, -70, 110, [255, 0,0]);
    makeTriangle(-70, 110, -120, 70, -40, -30, [240, 240,240]);
    makeTriangle(-70, 110, 10, 12, -40, -30, [240, 240,240]);
    //left wing
    makeTriangle(-53, -13, -85, -35, -79, 19, [255, 128, 0]);
    makeTriangle(-62, -60, -85, -35, -67, -22, [255, 0, 0]);
    makeTriangle(-62, -60, -46, -47, -67, -22, [255, 0, 0]);
    makeTriangle(-62, -60, -46, -47, -46, -78, [255, 0, 0]);

    //right wing
    makeTriangle(-26, 55, -1, 25, 32, 50, [255, 128, 0]);
    makeTriangle(14, 37, 32, 50, 38, 12, [255, 0, 0]);
    makeTriangle(53, 26, 32, 50, 38, 12, [255, 0, 0]);
    makeTriangle(53, 26, 71, 5, 38, 12, [255, 0, 0]);

    //window
    makeCircle(-72, 63, 20, 54, [64, 64, 64]);
    makeCircle(-72, 63, 17, 54, [0, 255, 255]);

    //rocket and fire
    makeTriangle(5, 8, 10, 2, -35, -26, [160, 160, 160]);
    makeTriangle(-30, -31, 10, 2, -35, -26, [160, 160, 160]);
    
    makeTriangle(-24, -26, 4, -2, 36, -70, [255, 160, 0]);
    makeTriangle(-24, -26, 4, -2, 19, -66, [255, 160, 0]);
    makeTriangle(-24, -26, 4, -2, 38, -54, [255, 160, 0]);
    makeTriangle(-19, -21, -1, -6, 10, -38, [255, 210, 0]);
    makeTriangle(-14, -18, -6, -11, 1, -28, [255, 255, 255]);

    //middle wing
    makeTriangle(-46, 20, -38, 27, -15, -18, [255,0,0]);
    makeTriangle(-7, -11, -38, 27, -15, -18, [255,0,0]);
    
}

function makeEarth(){
    makeCircle(250, -250, 180, 54, [0,128,255]);
    makeCircle(140, -160, 25, 36, [0,255,0]);
    makeCircle(180, -160, 25, 36, [0,255,0]);
    makeCircle(180, -190, 25, 36, [0,255,0]);
    makeTriangle(120, -175, 160, -160, 160, -220, [0,255,0]);
    makeTriangle(135, -135, 160, -165, 180, -135, [0,255,0]);
    makeCircle(210, -110, 20, 36, [0,255,0]);
}

function makeStars(){
    makeCircle(-20, -170, 4, 36, [255,255,255]);
    makeCircle(-160, -130, 6, 36, [255,255,255]);
    makeCircle(-30, -50, 4, 36, [255,255,255]);
    makeCircle(-190, 20, 3, 36, [255,255,255]);
    makeCircle(-150, 170, 4, 36, [255,255,255]);
    makeCircle(30, 110, 2, 36, [255,255,255]);
    makeCircle(140, -10, 5, 36, [255,255,255]);
    makeCircle(170, 180, 2, 36, [255,255,255]);
}