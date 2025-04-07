//asg0.js made by William Prigge
//wprigge@ucsc.edu

//Notes to grader: Used online resources and chatgpt for help with specific keywords and math functions
function main() {
    var canvas = document.getElementById("example");
    if(!canvas){
        console.log("Failed to retrieve <canvas> element");
        return;
    }

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //var v1 = new Vector3([2.25, 2.25, 0]);
    //drawVector(v1, "red");

}

function handleDrawOperationEvent(){
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    var x1 = parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);

    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);

    var v1 = new Vector3([x1,y1,0]);
    var v2 = new Vector3([x2,y2,0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    var operation = document.getElementById("operation").value;
    var scalar = parseFloat(document.getElementById("scalar").value);

    if(operation == "add"){
        var v3 = new Vector3([x1, y1, 0]);
        v3.add(v2);
        drawVector(v3, "green");
    } else if(operation == "sub"){
        var v3 = new Vector3([x1, y1, 0]);
        v3.sub(v2);
        drawVector(v3, "green");
    } else if(operation == "mul"){
        var v3 = new Vector3([x1, y1, 0]);
        var v4 = new Vector3([x2, y2, 0]);
        v3.mul(scalar);
        v4.mul(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if(operation == "div"){
        var v3 = new Vector3([x1, y1, 0]);
        var v4 = new Vector3([x2, y2, 0]);
        v3.div(scalar);
        v4.div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if(operation == "mag"){
        console.log("Magnitude v1:", v1.magnitude());
        console.log("Magnitude v2:", v2.magnitude());
    } else if(operation == "norm"){
        var v3 = new Vector3([x1, y1, 0]);
        var v4 = new Vector3([x2, y2, 0]);
        v3.normalize();
        v4.normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if(operation == "angle"){
        console.log("Angle: ", angleBetween(v1, v2));
    } else if(operation == "area"){
        console.log("Area of the triangle: ", areaTriangle(v1, v2));
    }
}

function areaTriangle(v1, v2){
    var cross = Vector3.cross(v1, v2);
    var area = 0.5 * cross.magnitude();
    return area;
}

function angleBetween(v1, v2){
    var dot = Vector3.dot(v1, v2);
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();

    if(mag1 == 0 || mag2 == 0) return 0;

    var cosTheta = dot / (mag1 * mag2);
    cosTheta = Math.max(-1, Math.min(1, cosTheta)); //Here to avoid rounding errors

    var radians = Math.acos(cosTheta);
    var degrees = radians * (180 / Math.PI);

    return degrees;
}

function handleDrawEvent(){
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    var x1 = parseFloat(document.getElementById("x1").value);
    var y1 = parseFloat(document.getElementById("y1").value);

    var x2 = parseFloat(document.getElementById("x2").value);
    var y2 = parseFloat(document.getElementById("y2").value);

    var v1 = new Vector3([x1,y1,0]);
    var v2 = new Vector3([x2,y2,0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function drawVector(v, color){
    var canvas = document.getElementById("example");
    var ctx = canvas.getContext("2d");

    var x0 = canvas.width/2;
    var y0 = canvas.height/2;

    var x1 = x0 + v.elements[0] * 20;
    var y1 = y0 - v.elements[1] * 20;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}