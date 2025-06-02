import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let scene, camera, renderer, controls;
const move = { forward: false, backward: false, left: false, right: false };
const clock = new THREE.Clock();
const speed = 2.5;
let meteorFalling = false;
let meteorSpawnTime = 0;
let overlayScene, overlayCamera, overlayMaterial;
let controlsDisabled = false;

//Press M text
const hintText = document.createElement('div');
hintText.innerText = 'Press M for extra feature';
hintText.style.position = 'fixed';
hintText.style.top = '20px';
hintText.style.left = '50%';
hintText.style.transform = 'translateX(-50%)';
hintText.style.fontSize = '16px';
hintText.style.fontWeight = 'bold';
hintText.style.color = 'white';
hintText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
hintText.style.padding = '8px 16px';
hintText.style.borderRadius = '5px';
hintText.style.zIndex = '9999';
document.body.appendChild(hintText);


// YOU DIED text
const deathText = document.createElement('div');
deathText.innerText = 'YOU DIED';
deathText.style.position = 'fixed';
deathText.style.top = '50%';
deathText.style.left = '50%';
deathText.style.transform = 'translate(-50%, -50%)';
deathText.style.fontSize = '100px';
deathText.style.fontWeight = 'bold';
deathText.style.color = 'black';
deathText.style.opacity = '0';
deathText.style.transition = 'opacity 2s ease';
deathText.style.zIndex = '9999';
document.body.appendChild(deathText);


function initScene() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    overlayScene = new THREE.Scene();
    overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    overlayMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0 
    });

    const overlayGeometry = new THREE.PlaneGeometry(2, 2);
    const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlayScene.add(overlayMesh);

    controls = new PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => controls.lock());
}

function addObjects() {
    // AMBIENT LIGHT
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
    scene.add(ambientLight);

    //SKYBOX
    const skyboxGeometry = new THREE.BoxGeometry(500, 500, 500);
    const skyboxMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    
    // MOON
    const moonGeometry = new THREE.SphereGeometry(12, 64, 64);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xfcffa3 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(80, 70, -100); 
    moon.name = 'moon';
    scene.add(moon);

    // MOONLIGHT
    const moonLight = new THREE.DirectionalLight(0xffffff, 1.5);
    moonLight.position.copy(moon.position); 
    moonLight.target.position.set(0, 0, 0); 
    scene.add(moonLight);
    scene.add(moonLight.target); 

    //VAN 3D MODEL
    const loader = new GLTFLoader();
    loader.load('models/Van2GLB.glb', (gltf) => {
    const car = gltf.scene;
    car.scale.set(0.7, 0.7, 0.7); 
    car.position.set(8, 0.3, -4);
    car.rotation.y = -Math.PI/2;    
    scene.add(car);
    }, undefined, (error) => {
    console.error('Error loading model:', error);
    });


    //CAMPFIRE LOGS
    const logMaterial = new THREE.MeshStandardMaterial({ color: 0x4B2E19 }); 

    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log1.position.set(0, -.9, 0);
    log1.rotation.z = Math.PI / 2;
    scene.add(log1);

    const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log2.position.set(0, -.9, 0);
    log2.rotation.z = Math.PI / 2;
    log2.rotation.y = Math.PI / 4;
    scene.add(log2);

    const log3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log3.position.set(0, -.9, 0);
    log3.rotation.z = Math.PI / 2;
    log3.rotation.y = Math.PI / 2;
    scene.add(log3);

    const log4 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log4.position.set(0, -.9, 0);
    log4.rotation.z = Math.PI / 2;
    log4.rotation.y = (3 * Math.PI) / 4;
    scene.add(log4);

    const log5 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log5.position.set(0, -0.8, 0);
    log5.rotation.z = Math.PI / 2;
    log5.rotation.y = Math.PI / 8;
    scene.add(log5);

    const log6 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log6.position.set(0, -0.8, 0);
    log6.rotation.z = Math.PI / 2;
    log6.rotation.y = (5 * Math.PI) / 8;
    scene.add(log6);

    const log7 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log7.position.set(0, -0.7, 0);
    log7.rotation.z = Math.PI / 2;
    log7.rotation.y = (7 * Math.PI) / 8;
    scene.add(log7);

    const log8 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 32), logMaterial);
    log8.position.set(0, -0.7, 0);
    log8.rotation.z = Math.PI / 2;
    log8.rotation.y = (3 * Math.PI) / 8;
    scene.add(log8);


    // CAMPFIRE FIRE
    const fireGeometry = new THREE.ConeGeometry(0.4, 1.35, 32);
    const fireMaterial = new THREE.MeshStandardMaterial({color: 0xff4500, emissive: 0xff2200,emissiveIntensity: 1.5});
    const fireCone = new THREE.Mesh(fireGeometry, fireMaterial);
    fireCone.position.set(0, 0.0, 0); 
    fireCone.name = 'fireCone';
    scene.add(fireCone);

    // CAMPFIRE LIGHT
    const fireLight = new THREE.PointLight(0xff6a00, 10, 30); 
    fireLight.position.set(0, 0.3, 0);
    fireLight.name = 'fireLight';
    scene.add(fireLight);


    //LOGS
    const bigLogMaterial = new THREE.MeshStandardMaterial({ color: 0x4f3c00 });

    const bigLog1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 32), bigLogMaterial);
    bigLog1.position.set(-2, -1, -2);
    bigLog1.rotation.x = Math.PI / 2;
    bigLog1.rotation.z = Math.PI / 4;
    scene.add(bigLog1);

    const bigLog2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 32), bigLogMaterial);
    bigLog2.position.set(2.5, -1, -1);
    bigLog2.rotation.x = Math.PI / 2;
    bigLog2.rotation.z = -Math.PI * 0.03;
    scene.add(bigLog2);


    //TENT MAIN
    const tentGeometry = new THREE.BoxGeometry(5, 2.8, 2.8); 
    const tentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8888aa, 
    emissive: 0x111111, 
    emissiveIntensity: 0.5 
    });
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.position.set(8, -1, 2); 
    tent.rotation.x = Math.PI / 4;  
    scene.add(tent);

    //TENT OPENING
    const tentLineGeo = new THREE.BoxGeometry(0.05, 2, 0.05);
    const tentLineMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const tentLine = new THREE.Mesh(tentLineGeo, tentLineMaterial);
    tentLine.position.set(5.52, -0.05, 2);
    
    scene.add(tentLine);

    //TENT ROPES
    const ropePoints1 = [
        new THREE.Vector3(5.5, 0.95, 2),     
        new THREE.Vector3(4, -1, 0.5),  
    ];

    const ropeGeo1 = new THREE.BufferGeometry().setFromPoints(ropePoints1);
    const ropeMat1 = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ropeLine1 = new THREE.Line(ropeGeo1, ropeMat1);
    scene.add(ropeLine1);

    const ropePoints2 = [
        new THREE.Vector3(5.5, 0.95, 2),     
        new THREE.Vector3(4, -1, 3.3),  
    ];

    const ropeGeo2 = new THREE.BufferGeometry().setFromPoints(ropePoints2);
    const ropeMat2 = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ropeLine2 = new THREE.Line(ropeGeo2, ropeMat2);
    scene.add(ropeLine2);
    
    // FLOOR
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x0f4200 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);
    
    addStars(150);
    addTree(-4, 2);
    addTree(-7, -8);
    addTree(-2, -15);
    addTree(6, -15);
    addTree(18, -5);
    addTree(21, 7);
    addTree(10, 9);
    addTree(-25, -6);
    addTree(0, 20);
    addTree(-9, 14);
    addTree(5, 15);
}

function addStars(count) {
    const starGeometry = new THREE.SphereGeometry(0.2, 8, 8); 
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < count; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);

        const x = (Math.random() - 0.5) * 300;
        const y = 40 + Math.random() * 40; 
        const z = (Math.random() - 0.5) * 300;

        star.position.set(x, y, z);
        scene.add(star);
    }
}

function addTree(x, z) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 
    const leafTexture = new THREE.TextureLoader().load('leaf7.jpg');
    const leafMaterial = new THREE.MeshStandardMaterial({ map: leafTexture });

    //TRUNK
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 1.5, z); 
    scene.add(trunk);

    // ROOTS
    const trunkGeometry1 = new THREE.CylinderGeometry(0, 1.5, 0.5, 64);
    const trunk1 = new THREE.Mesh(trunkGeometry1, trunkMaterial);
    trunk1.position.set(x, -0.8, z);
    scene.add(trunk1);

    // LEAVES
    const leafSphere = new THREE.Mesh(new THREE.SphereGeometry(2.7, 32, 32),leafMaterial);
    leafSphere.position.set(x, 6, z); 
    scene.add(leafSphere);
}





function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') move.forward = true;
        if (e.code === 'KeyS') move.backward = true;
        if (e.code === 'KeyA') move.left = true;
        if (e.code === 'KeyD') move.right = true;
        if (e.code === 'KeyM' && !meteorFalling) {createMeteor(); if (hintText) hintText.remove();}
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') move.forward = false;
        if (e.code === 'KeyS') move.backward = false;
        if (e.code === 'KeyA') move.left = false;
        if (e.code === 'KeyD') move.right = false;
    });
}

function createMeteor() {
    meteorFalling = true;
    meteorSpawnTime = clock.getElapsedTime();

    const meteorGeo = new THREE.SphereGeometry(1,32,32);
    const meteorMat = new THREE.MeshStandardMaterial({color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 100});
    const meteor = new THREE.Mesh(meteorGeo, meteorMat);
    meteor.position.set(0,90,0);
    meteor.name = 'theMeteor';
    
    const meteorLight = new THREE.PointLight(0xff2200, 10000, 400);
    meteorLight.position.set(0,90,0);
    meteorLight.name = 'meteorLight';
    scene.add(meteorLight);
    scene.add(meteor);
}


function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const eTime = clock.getElapsedTime();
    const direction = new THREE.Vector3();

    if (controls.isLocked && !controlsDisabled) {
        if (move.forward) direction.z += 1;
        if (move.backward) direction.z -= 1;
        if (move.left) direction.x -= 1;
        if (move.right) direction.x += 1;

        direction.normalize().multiplyScalar(speed * delta);
        controls.moveRight(direction.x);
        controls.moveForward(direction.z);
    }

    const fr = scene.getObjectByName('fireCone');
    if(fr){
        fr.scale.y = 1 + (0.15 * Math.sin(eTime * 5));
        fr.position.set(0, 0.1 * Math.sin(eTime * 5) - 0.04, 0)
    }

    if(meteorFalling){
        const doomMeteor = scene.getObjectByName('theMeteor');
        const doomLight = scene.getObjectByName('meteorLight');
        if(doomMeteor && doomLight){

            const t = clock.getElapsedTime() - meteorSpawnTime;
            if(t <= 8){
                const gettingBigger = Math.min(t / 8, 1);
                const newScale = 1 + (1) * gettingBigger;
                doomMeteor.scale.set(newScale, newScale, newScale);
            }

            if (t > 8) {
                const fallTime = t - 8;
                const fallProgress = Math.min(fallTime / 15, 1);
                const easeIn = x => Math.pow(Math.min(x * 1.5, 1), 2.5);
                const easedFall = easeIn(fallProgress);
                const newY = 90 - 90 * easedFall;
                doomMeteor.position.y = newY;

                const fadeAmount = Math.min((t-12)/10, 1);
                overlayMaterial.opacity = fadeAmount * 0.4;

                if(t >= 18 && !controlsDisabled){
                    controls.unlock();
                    controlsDisabled = true;
                    deathText.style.opacity = '1';
                }
            }

            doomLight.position.copy(doomMeteor.position);

        }
    }
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.clear(); 
    renderer.render(scene, camera);
    renderer.clearDepth(); 
    renderer.render(overlayScene, overlayCamera);
}

initScene();
addObjects();
setupControls();
animate();
