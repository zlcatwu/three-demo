import * as THREE from 'three';
import dat from 'dat.gui';
import Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import fireFliesVertexShader from './shaders/fireflies/vertexShader.glsl?raw';
import fireFliesFragmentShader from './shaders/fireflies/fragmentShader.glsl?raw';
import portalVertexShader from './shaders/portal/vertexShader.glsl?raw';
import portalFragmentShader from './shaders/portal/fragmentShader.glsl?raw';

import textureBaked from './static/baked.jpg?url';
import modelScene from './static/scene.glb?url';

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

    firefliesMaterial.uniforms.uDevicePixelRatio.value = Math.min(window.devicePixelRatio, 2);
});


/**
 * Degbug
 */

const isDebug = location.hash.includes('debug');

const debugObject = {};
const gui = new dat.GUI({ width: 400 });
!isDebug && gui.hide();

const stats = new Stats();
isDebug && document.body.appendChild(stats.dom);


/**
 * Loader
 */

const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();


/**
 * Canvas
 */

const canvas = document.querySelector('#webgl');


/**
 * Scene
 */

const scene = new THREE.Scene();


/**
 * Texture
 */

const bakedTexture = textureLoader.load(textureBaked);
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;


/**
 * Materials
 */

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff9621 });
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: {
            value: 0
        },
        uColorStart: {
            value: new THREE.Color('#2590e8')
        },
        uColorEnd: {
            value: new THREE.Color('#8affff')
        }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
});
debugObject.portalColorStart = '#2590e8';
debugObject.portalColorEnd = '#8affff';
gui.addColor(debugObject, 'portalColorStart')
    .onChange(() => {
        portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
    });
gui.addColor(debugObject, 'portalColorEnd')
    .onChange(() => {
        portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
    });

/**
 * Model
 */

gltfLoader.load(
    modelScene,
    gltf => {
        gltf.scene.children.find(item => item.name === 'baked')
            .material = bakedMaterial;
        gltf.scene.children.find(item => item.name === 'poleLightA')
            .material = poleLightMaterial;
        gltf.scene.children.find(item => item.name === 'poleLightB')
            .material = poleLightMaterial;
        gltf.scene.children.find(item => item.name === 'portalLight')
            .material = portalLightMaterial;

        scene.add(gltf.scene);
    }
);


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

const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3] = (Math.random() - 0.5) * 3.5;
    positionArray[i * 3 + 1] = Math.random() * 1.5;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

    scaleArray[i] = Math.random() + 0.5;
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uDevicePixelRatio: {
            value: Math.min(window.devicePixelRatio, 2)
        },
        uSize: {
            value: 40
        },
        uTime: {
            value: 0
        }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: fireFliesVertexShader,
    fragmentShader: fireFliesFragmentShader
});

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);


/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

debugObject.clearColor = '#201919';
renderer.setClearColor(debugObject.clearColor);
gui.addColor(debugObject, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(debugObject.clearColor);
    });


/**
 * Tick
 */

const clock = new THREE.Clock();
function tick () {
    stats.begin();
    controls.update();

    const elapsedTime = clock.getElapsedTime();
    firefliesMaterial.uniforms.uTime.value = elapsedTime;
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(tick);
}

tick();
