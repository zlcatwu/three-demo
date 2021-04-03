import * as THREE from 'three';
import dat from 'dat.gui';
import Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Sizes
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


/**
 * Degbug
 */

const isDebug = location.hash.includes('debug');

const gui = new dat.GUI({ width: 340 });
!isDebug && gui.hide();

const stats = new Stats();
isDebug && document.body.appendChild(stats.dom);


/**
 * Canvas
 */

const canvas = document.querySelector('#webgl');


/**
 * Scene
 */

const scene = new THREE.Scene();


/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


/**
 * Objects
 */

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 'red' });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);


/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/**
 * Tick
 */

function tick () {
    stats.begin();

    controls.update();

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(tick);
}

tick();
