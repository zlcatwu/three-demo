import * as THREE from 'three';
import Stats from 'stats.js';
import dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

import textureMap from './textures/earth/map.png?url';
import shaderVertex from './shaders/earth/vertex.glsl?raw';
import shaderFragment from './shaders/earth/fragment.glsl?raw';

/**
 * 转动的地球
 * 覆盖世界地图，可以对坐标进行定位，有线穿梭
 */

export default class Earth {

    /**
     *
     * @param {Element} options.dom
     * @param {Element?} options.resizeDom
     * @param {boolean?} options.debug
     */
    constructor (options = {}) {
        if (!options.dom || options.dom.tagName !== 'CANVAS') {
            throw new Error('options.dom is not a canvas');
        }

        options.debug && this._initDebug();
        this.canvas = options.dom;
        this.resizeDom = options.resizeDom || document.body;

        this._initParameters();
        this._initLoader();
        this._initRenderer();
        this._initCamera();
        this._initScene();
        this._initEarth();
        this._initWorldMap();
        this._initMarker();
        this._initLine();

        const resizeObserver = new ResizeObserver(this._onResize.bind(this));
        resizeObserver.observe(this.resizeDom);

        this._tick();
    }

    /**
     *
     * @param {number|string} options.id
     * @param {number} options.lon
     * @param {number} options.lat
     */
    addMarker (options) {
        const geometry = new THREE.CylinderGeometry(0.005, 0.005, 0.1);
        geometry.translate(0, -0.05, 0);
        geometry.rotateZ(Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x85dcff, transparent: true, opacity: 0.8 });
        const marker = new THREE.Mesh(geometry, material);

        const pos = this._coordToPosition(options.lat, options.lon, 2);
        marker.position.set(pos.x, pos.y, pos.z);
        marker.rotation.y = THREE.Math.degToRad(options.lon);
        marker.rotation.z = THREE.Math.degToRad(options.lat);
        marker.scale.x = 0;
        marker.userData.id = options.id;

        this.markers.add(marker);

        marker.userData.tween = gsap.fromTo(marker.scale, { x: 0 }, { x: 1, duration: 1, delay: 0.5 });
    }

    /**
     *
     * @param {number|string} id
     */
    removeMarker (id) {
        const marker = this.markers.children.find(marker => marker?.userData.id === id);
        if (!marker) {
            return;
        }

        marker.userData.tween.kill();
        const tween = gsap.to(marker.scale, {
            x: 0,
            duration: 1,
            delay: 0.5,
            onComplete: () => {
                tween.kill();
                this.markers.remove(marker);
            }
        });
    }

    /**
     *
     * @param {number|string} options.id
     *
     * @param {number} options.from.lon
     * @param {number} options.from.lat
     *
     * @param {number} options.to.lon
     * @param {number} options.to.lat
     */
    addLine (options) {
        const fromPos= this._coordToPosition(options.from.lat, options.from.lon, 2.01);
        const toPos = this._coordToPosition(options.to.lat, options.to.lon, 2.01);
        const controlPos1 = this._coordToPosition(
            (options.to.lat - options.from.lat) / 4 + options.from.lat,
            (options.to.lon - options.from.lon) / 4 + options.from.lon,
            3
        );
        const controlPos2 = this._coordToPosition(
            (options.to.lat - options.from.lat) / 4 * 3 + options.from.lat,
            (options.to.lon - options.from.lon) / 4 * 3 + options.from.lon,
            3
        );
        const curve = new THREE.CubicBezierCurve3(
            fromPos,
            controlPos1,
            controlPos2,
            toPos
        );
        const points = curve.getPoints(99);
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 'red' });
        const line = new THREE.Line(geometry, material);

        const pointGeometry = new THREE.CircleGeometry(0.01, 16);
        pointGeometry.rotateY(Math.PI / 2);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
        const fromPoint = new THREE.Mesh(pointGeometry, pointMaterial);
        fromPoint.position.set(fromPos.x, fromPos.y, fromPos.z);
        this.lines.add(fromPoint);

        const toPoint = new THREE.Mesh(pointGeometry, pointMaterial);
        toPoint.position.set(toPos.x, toPos.y, toPos.z);
        toPoint.rotation.y = THREE.Math.degToRad(options.to.lon);
        toPoint.rotation.z = THREE.Math.degToRad(options.to.lat);
        this.lines.add(toPoint);

        geometry.setDrawRange(0, 0);
        const params = { start: 0, end: 0, scale: 0 };
        const timeline = gsap.timeline();
        timeline
            .to(params, {
                scale: 1,
                duration: 0.5,
                onUpdate: () => {
                    fromPoint.scale.set(params.scale, params.scale, params.scale);
                    toPoint.scale.set(params.scale, params.scale, params.scale);
                }
            })
            .to(params, {
                end: points.length,
                duration: 1,
                delay: 0.5,
                onUpdate: () => {
                    geometry.setDrawRange(0, Math.ceil(params.end));
                }
            })
            .to(params, {
                start: points.length,
                end: points.length,
                duration: 1,
                delay: 0.5,
                onUpdate: () => {
                    geometry.setDrawRange(Math.ceil(params.start), points.length);
                }
            })
            .to(params, {
                scale: 0,
                duration: 0.5,
                onUpdate: () => {
                    fromPoint.scale.set(params.scale, params.scale, params.scale);
                    toPoint.scale.set(params.scale, params.scale, params.scale);
                },
                onComplete: () => {
                    timeline.kill();
                }
            });

        this.lines.add(line);
    }

    _coordToPosition (lat, lon, radius) {
        return new THREE.Vector3().setFromSphericalCoords(
            radius,
            THREE.Math.degToRad(90 - lat),
            THREE.Math.degToRad(90 + lon)
        );
    }

    _initMarker () {
        this.markers = new THREE.Group();
        this.scene.add(this.markers);
    }

    _initLine () {
        this.lines = new THREE.Group();
        this.scene.add(this.lines);
    }

    _initEarth () {
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const material = new THREE.MeshMatcapMaterial();
        material.matcap = this.textureLoader.load('./textures/earth/matcap.png');
        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
    }

    _initWorldMap () {
        const geometry = new THREE.SphereGeometry(2.0, 1024, 256);
        const material = new THREE.ShaderMaterial({
            vertexShader: shaderVertex,
            fragmentShader: shaderFragment,
            uniforms: {
                uWorldMap: {
                    value: this.textureLoader.load(textureMap)
                }
            },
            transparent: true
        });
        const map = new THREE.Points(geometry, material);
        this.scene.add(map);
    }

    _initParameters () {
        this.parameters = {
            size: {
                width: this.resizeDom.offsetWidth,
                height: this.resizeDom.offsetHeight
            }
        };
    }

    _initDebug () {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        this.gui = new dat.GUI();
    }

    _initLoader () {
        this.textureLoader = new THREE.TextureLoader();
    }

    _initRenderer () {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });
    }

    _initCamera () {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.parameters.size.width / this.parameters.size.height,
            0.1,
            2000
        );
        this.camera.position.set(0, 0, 4);
        this.controls = new OrbitControls(this.camera, this.canvas);

        if (this.gui) {
            const camera = this.gui.addFolder('camera');
            camera.add(this.camera.position, 'x', -20, 20, 0.1)
                .name('position.x');
            camera.add(this.camera.position, 'y', -20, 20, 0.1)
                .name('position.y');
            camera.add(this.camera.position, 'z', -20, 20, 0.1)
                .name('position.z');
        }
    }

    _initScene () {
        this.scene = new THREE.Scene();
    }

    _onResize () {
        this.parameters.size.width = this.resizeDom.offsetWidth;
        this.parameters.size.height = this.resizeDom.offsetHeight;

        const { width, height } = this.parameters.size;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    _tick () {
        this.stats.begin();

        this.renderer.render(this.scene, this.camera);

        this.stats.end();

        requestAnimationFrame(this._tick.bind(this));
    }
}

