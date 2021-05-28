import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// @ts-ignore
import { BlurPass, EffectComposer, RenderPass } from "postprocessing";
import { IKernelRunShortcut } from "gpu.js";
import { getMainKernel } from "./shape_logic";

// @ts-ignore
import * as Perlin from "perlin";
import useTween from "./useTween";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { noise } from "./perlin3";

const
    AMBIENT_LIGHT_INTENSITY = .22,
    DIRECTIONAL_LIGHT_INTENSITY = .8,
    MOUSE_LIGHT_INTENSITY = .4,
    COLOR_VARIANCE = .44,
    BLUR_PIXELS = 8,
    ABOUT_POINTS_SIZE = .2,
    ABOUT_SCALE_INCREMENT = 3,
    ABOUT_POINTS_OPACITY = .5,
    ABOUT_WIREFRAME_OPACITY = .3,
    ABOUT_CAMERA_Y_OFFSET = 600,
    SHAPE_Y_OFFSET = 200,
    CAMERA_Y_OFFSET_SCROLL = -300,
    CAMERA_Z_OFFSET = 1000,
    GRID_SPEED = 1400,
    LIGHT_COLOR_SATURATION = .9,
    LIGHT_COLOR_LIGHTNESS = .37,
    BG_COLOR_SATURATION = .75,
    BG_COLOR_LIGHTNESS = .5,
    MOUSE_LIGHT_DISTANCE_TO_CENTER = 700,
    SHAPE_RADIUS = 200;


const WHITE = new THREE.Color(0xFFFFFF),
    GREY = new THREE.Color(0xCCCCCC),
    RED = new THREE.Color(0xFF0000),
    GREEN = new THREE.Color(0x09CAA1),
    YELLOW = new THREE.Color(0xFFFF00),
    STRONG_BLUE = new THREE.Color(0x0025FF),
    LIGHT_GREEN = new THREE.Color(0x70C4CE),
    DARKENED_GREEN = new THREE.Color(0x0D7182),
    ORANGE = new THREE.Color(0xf66023),
    PURPLE = new THREE.Color(0x590D82),
    MAGENTA = new THREE.Color(0xC6A0C0),
    PINK = new THREE.Color(0xCE70A5);


const randomColor = () => new THREE.Color().setHSL(Math.random(), LIGHT_COLOR_SATURATION, LIGHT_COLOR_LIGHTNESS);
let
    LIGHT_1_COLOR_BASE: THREE.Color,
    LIGHT_2_COLOR_FROM: THREE.Color,
    LIGHT_2_COLOR_TO: THREE.Color,
    LIGHT_3_COLOR_FROM: THREE.Color,
    LIGHT_3_COLOR_TO: THREE.Color,
    MATERIAL_COLOR_FROM: THREE.Color,
    MATERIAL_COLOR_TO: THREE.Color,
    WIREFRAME_COLOR_TO: THREE.Color,
    BACKGROUND_COLOR_FROM: THREE.Color,
    BACKGROUND_COLOR_TO: THREE.Color;

function setUpLightColors() {

    const colorWithHue = (hue: number): THREE.Color => new THREE.Color().setHSL(hue, LIGHT_COLOR_SATURATION, LIGHT_COLOR_LIGHTNESS);
    MATERIAL_COLOR_FROM = randomColor();

    const hslFrom = { h: 0, s: 0, l: 0 };
    MATERIAL_COLOR_FROM.getHSL(hslFrom);

    MATERIAL_COLOR_TO = colorWithHue(hslFrom.h + COLOR_VARIANCE / 3 * 2);
    const hslTo = { h: 0, s: 0, l: 0 };
    MATERIAL_COLOR_TO.getHSL(hslFrom);

    WIREFRAME_COLOR_TO = colorWithHue(hslFrom.h + COLOR_VARIANCE * 3 / 2);
    LIGHT_1_COLOR_BASE = colorWithHue(hslFrom.h + (Math.random() - .5) * COLOR_VARIANCE);
    LIGHT_2_COLOR_FROM = colorWithHue(hslFrom.h + COLOR_VARIANCE / 2);
    LIGHT_3_COLOR_FROM = colorWithHue(hslFrom.h - COLOR_VARIANCE / 2);
    LIGHT_2_COLOR_TO = colorWithHue(hslTo.h - COLOR_VARIANCE / 2);
    LIGHT_3_COLOR_TO = colorWithHue(hslTo.h + COLOR_VARIANCE / 2);

    BACKGROUND_COLOR_FROM = MATERIAL_COLOR_FROM.clone().lerp(LIGHT_2_COLOR_FROM.clone().lerp(LIGHT_3_COLOR_FROM.clone(), .5).lerp(LIGHT_1_COLOR_BASE.clone(), .3), .3);
    BACKGROUND_COLOR_TO = MATERIAL_COLOR_TO.clone().lerp(LIGHT_2_COLOR_TO.clone().lerp(LIGHT_3_COLOR_TO.clone(), .5).lerp(LIGHT_1_COLOR_BASE.clone(), .3), .3);

}

setUpLightColors();

type SpikeConfig = {
    activated: boolean,
    period: number,
    size: number
};

type ShapeProps = {
    spikeAmount: number;
    perlinAmount: number;
    rotationX: number;
    scale: number;
    o1: number;
    o2: number;
    o3: number;
    o4: number;
};

export function Shape(props: ShapeProps) {

    const requestRef = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const composerRef = useRef<EffectComposer>();
    const renderPassRef = useRef<RenderPass>();
    const blurPassRef = useRef<BlurPass>();
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());

    const calculateShapeVectorsRef = useRef<IKernelRunShortcut>();

    const sceneRef = useRef<THREE.Scene>();
    const geometryRef = useRef<THREE.BufferGeometry>();
    const cameraRef = useRef<THREE.Camera>();
    const shapesRef = useRef<(THREE.Mesh | THREE.Points)[]>([]);

    const originalVerticesRef = useRef<THREE.Vector3[]>([]);
    const verticesConfigRef = useRef<SpikeConfig[]>([]);

    const materialRef = useRef<THREE.Material>();
    const material2Ref = useRef<THREE.Material>();
    const materialWireframeRef = useRef<THREE.Material>();
    const materialPointsRef = useRef<THREE.Material>();
    const lightRef = useRef<THREE.Light>();
    const light2Ref = useRef<THREE.Light>();
    const light3Ref = useRef<THREE.Light>();
    const light4Ref = useRef<THREE.Light>();

    const easedSpikeAmount = useTween(props.spikeAmount, "linear", 1000);
    const easedPerlinAmount = useTween(props.perlinAmount, "linear", 1000);
    const easedRotationX = useTween(props.rotationX, "linear", 1000);
    const easedScale = useTween(props.scale, "linear", 1300);
    const easedProps: ShapeProps = {
        spikeAmount: easedSpikeAmount,
        perlinAmount: easedPerlinAmount,
        rotationX: easedRotationX,
        scale: easedScale,
        o1: props.o1,
        o2: props.o2,
        o3: props.o3,
        o4: props.o4
    };

    useEffect(() => {

        if (!canvasRef.current) return;

        const width = canvasRef.current.offsetWidth,
            height = canvasRef.current.offsetHeight;

        const scene = initScene(width, height);
        const camera = initCamera(width, height);
        initRenderer(canvasRef.current, width, height, scene, camera);

        initKernels();

    }, [canvasRef]);

    useEffect(() => {

        const composer = composerRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!scene || !camera || !composer) return;

        requestRef.current = requestAnimationFrame(
            (time) =>
                animate(time,
                    composer,
                    scene,
                    camera,
                    props));

        return () => {
            cancelAnimationFrame(requestRef.current);
        };

    }, [props]);


    function updateShapeRotationX(rotationX: number) {
        shapesRef.current.forEach((s) => s.rotation.x = rotationX);
    }

    function updateScale(scale: number) {
        shapesRef.current.forEach((s) => s.scale.set(scale, scale, scale));
    }

    function enableBlur() {
        renderPassRef.current.renderToScreen = false;
        blurPassRef.current.enabled = true;
    }

    function disableBlur() {
        renderPassRef.current.renderToScreen = true;
        blurPassRef.current.enabled = false;
    }

    function updateBlur(position: number, aboutPosition: number) {

        if (aboutPosition > .3) {
            disableBlur();
            return;
        }

        if (position > 0.8) {
            enableBlur();
        } else {
            disableBlur();
        }
    }

    function updateSceneMaterialsOpacity(o1: number, o2: number, o3: number, o4: number) {

        if (!materialRef.current || !material2Ref.current || !materialWireframeRef.current || !materialPointsRef.current) return;

        // materialRef.current.opacity = o1;
        material2Ref.current.opacity = o2;
        materialWireframeRef.current.opacity = o3;
        materialPointsRef.current.opacity = o4;
    }

    function updateSceneColors(position: number) {

        if (!materialRef.current || !material2Ref.current || !light2Ref.current || !light3Ref.current) return;

        const materialColor = MATERIAL_COLOR_FROM.clone().lerp(MATERIAL_COLOR_TO, position);

        // @ts-ignore
        lightRef.current.groundColor = LIGHT_1_COLOR_BASE;
        // @ts-ignore
        // materialRef.current.emissive.set(materialColor);
        // @ts-ignore
        material2Ref.current.emissive.set(materialColor);
        light2Ref.current.color.set(LIGHT_2_COLOR_FROM.clone().lerp(LIGHT_2_COLOR_TO, position));
        light3Ref.current.color.set(LIGHT_3_COLOR_FROM.clone().lerp(LIGHT_3_COLOR_TO, position));
    }

    const initKernels = () => {
        if (calculateShapeVectorsRef.current)
            return;

        const vectors = originalVerticesRef.current;
        calculateShapeVectorsRef.current = getMainKernel(vectors.length, false);
    };

    function updateVertices(time: number,
                            spikeAmount: number,
                            perlinAmount: number) {

        if (!calculateShapeVectorsRef.current)
            return;

        const calculateShapeVectors = calculateShapeVectorsRef.current;

        const verticesMatrix: [number, number, number][] = originalVerticesRef.current.map((v) => [v.x, v.y, v.z]);
        const configMatrix = verticesConfigRef.current.map(config => [config.activated ? 1 : 0, config.period, config.size]);

        const updatedVectors: [number, number, number][] =
            calculateShapeVectors(
                verticesMatrix,
                configMatrix,
                spikeAmount,
                perlinAmount,
                time) as [number, number, number][];

        // const totalAmountSet = perlinAmount + spikeAmount;
        // const baseAmount = 1 - Math.min(totalAmountSet, 1);
        // const normalisedPerlinAmount = Math.min(perlinAmount, perlinAmount / totalAmountSet);
        // const normalisedSpikesAmount = Math.min(spikeAmount, spikeAmount / totalAmountSet);
        //
        // console.log("totalAmountSet", totalAmountSet);
        // console.log("baseAmount", baseAmount);
        // console.log("normalisedPerlinAmount", normalisedPerlinAmount);
        // console.log("normalisedSpikesAmount", normalisedSpikesAmount);

        const jsUpdatedVectors: [number, number, number][] = verticesMatrix.map((v) => {
            let s = 0.01;
            let r = time * 0.000025;
            let xin = (v[0] * s) + r;
            let yin = (v[1] * s) + r;
            let zin = (v[2] * s) + r;

            let number = noise(xin, yin, zin) + 1;
            return [
                v[0] * number,
                v[1] * number,
                v[2] * number
            ];
        });


        if (time < 2000) {
            console.log("verticesMatrix", verticesMatrix);
            console.log("updatedVectors", updatedVectors);
            console.log("jsUpdatedVectors", jsUpdatedVectors);
        }

        if (geometryRef.current) {
            jsUpdatedVectors.forEach((value, i) => {
                geometryRef.current.attributes.position.array[i * 3] = value[0];
                geometryRef.current.attributes.position.array[i * 3 + 1] = value[1];
                geometryRef.current.attributes.position.array[i * 3 + 2] = value[2];
            });
            // geometryRef.current.attributes.position.needsUpdate = true;
            // geometryRef.current.computeBoundingSphere();
            // geometryRef.current.computeBoundingBox();
        }
    }


    const initScene = (width: number, height: number) => {

        if (sceneRef.current)
            return sceneRef.current;
        console.log("initScene");

        const scene = new THREE.Scene();
        const light = new THREE.HemisphereLight(WHITE, LIGHT_1_COLOR_BASE, AMBIENT_LIGHT_INTENSITY);
        light.position.set(400, 400, 0);
        scene.add(light);
        lightRef.current = light;

        const light2 = new THREE.DirectionalLight(LIGHT_2_COLOR_FROM, DIRECTIONAL_LIGHT_INTENSITY);
        light2.position.set(400, 0, 500);
        scene.add(light2);
        scene.add(new THREE.SpotLightHelper(light2));
        light2Ref.current = light2;

        const light3 = new THREE.DirectionalLight(LIGHT_3_COLOR_FROM, DIRECTIONAL_LIGHT_INTENSITY);
        light3.position.set(-400, 0, 500);
        scene.add(light3);
        scene.add(new THREE.SpotLightHelper(light3));
        light3Ref.current = light3;

        const light4 = new THREE.DirectionalLight(YELLOW, .1);
        light4.position.set(-200, 200, 200);
        scene.add(light4);
        scene.add(new THREE.SpotLightHelper(light4));
        light4Ref.current = light4;

        let geometry = new THREE.DodecahedronGeometry(SHAPE_RADIUS, 12);
        console.log("pointsCount prev", geometry.attributes.position.array.length);
        // let geometry = new THREE.PlaneGeometry(400, 400, 100, 100);
        // delete geometry.attributes.normal;
        delete geometry.attributes.uv;
        geometry = BufferGeometryUtils.mergeVertices(geometry);

        geometry.computeBoundingSphere();

        const pointsCount = geometry.attributes.position.array.length / 3;
        console.log("pointsCount", geometry.attributes.position.array.length, pointsCount);

        for (let i = 0; i < pointsCount; i++) {
            const vector = new THREE.Vector3();
            vector.fromBufferAttribute(geometry.attributes.position, i);
            originalVerticesRef.current.push(vector);
        }

        verticesConfigRef.current = new Array(pointsCount);
        for (let i = 0; i < pointsCount; ++i)
            verticesConfigRef.current[i] = {
                activated: Math.random() < .3,
                period: (Math.random() * 3 + 3) * 1000,
                size: (Math.random() - 0.5) * 1.5 + 2
            };

        // const material = new THREE.MeshLambertMaterial({
        //     // map: texture,
        //     emissive: MATERIAL_COLOR_FROM,
        //     emissiveIntensity: .6,
        //     transparent: true
        // });
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 1.0 }
            },
            vertexShader: buildVertexShader(),
            fragmentShader: buildFragmentShader()

        });

        materialRef.current = material;

        const material2 = new THREE.MeshPhongMaterial({
            transparent: true
        });
        material2Ref.current = material2;

        const materialWireframe = new THREE.MeshPhongMaterial({
            emissive: WIREFRAME_COLOR_TO,
            emissiveIntensity: .6,
            transparent: true
        });
        materialWireframe.wireframe = true;
        materialWireframeRef.current = materialWireframe;

        const materialPoints = new THREE.PointsMaterial({
            color: GREY,
            size: ABOUT_POINTS_SIZE,
            transparent: true,
            opacity: 0,
            sizeAttenuation: false
        });
        materialPointsRef.current = materialPoints;

        const shape = new THREE.Mesh(geometry, material);
        shape.material.side = THREE.DoubleSide;
        const shape2 = new THREE.Mesh(geometry, material2);
        shape2.material.side = THREE.DoubleSide;
        const shapeWireframe = new THREE.Mesh(geometry, materialWireframe);
        shapeWireframe.material.side = THREE.DoubleSide;

        const shapePoints = new THREE.Points(geometry, materialPoints);

        scene.add(shape);
        scene.add(shape2);
        scene.add(shapeWireframe);
        scene.add(shapePoints);

        const geometryPlane = new THREE.BoxGeometry( 0.75, 0.75, 0.75 );

        // const geometryPlane = new THREE.PlaneGeometry( 2, 2 );

        const uniforms = {
            time: { value: 1.0 }
        };

        const materialPlane = new THREE.ShaderMaterial( {

            uniforms: uniforms,
            vertexShader: buildVertexShader(),
            fragmentShader: buildFragmentShader()

        } );

        const mesh = new THREE.Mesh( geometryPlane, materialPlane );
        scene.add( mesh );

        sceneRef.current = scene;
        geometryRef.current = geometry;
        shapesRef.current = [shape, shape2, shapeWireframe, shapePoints];

        return scene;
    };

    const initCamera = (width: number, height: number) => {

        if (cameraRef.current)
            return cameraRef.current;

        const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 3000);
        camera.position.set(0, 0, CAMERA_Z_OFFSET);
        // camera.left = width / -2;
        // camera.right = width / 2;
        // camera.top = height / 2;
        // camera.bottom = height / -2;

        cameraRef.current = camera;

        return camera;
    };

    function buildVertexShader() {
        return `
        	varying vec2 vUv;

			void main()	{

				vUv = uv;

				gl_Position = vec4( position, 1.0 );

			}
        `;
    }

    function buildFragmentShader() {
        return `
			uniform float time;

			varying vec2 vUv;

			void main( void ) {

				vec2 position = - 1.0 + 2.0 * vUv;

				float red = abs( sin( position.x * position.y + time / 5.0 ) );
				float green = abs( sin( position.x * position.y + time / 4.0 ) );
				float blue = abs( sin( position.x * position.y + time / 3.0 ) );
				gl_FragColor = vec4( red, green, blue, 1.0 );

			}
        `;
    }

    function initRenderer(ref: HTMLCanvasElement, width: number, height: number, scene: THREE.Scene, camera: THREE.Camera) {

        if (composerRef.current)
            return composerRef.current;

        const renderer = new THREE.WebGLRenderer({
            antialias:true,
            alpha: true,
            canvas: ref
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        renderPassRef.current = renderPass;

        const blurPass = new BlurPass();
        blurPass.renderToScreen = true;
        blurPass.resolutionScale = .5;
        blurPassRef.current = blurPass;
        composer.addPass(blurPass);

        composerRef.current = composer;

        return composer;
    }


    const animate = (time: number,
                     composer: EffectComposer,
                     scene: THREE.Scene,
                     camera: THREE.Camera,
                     shapeProps: ShapeProps) => {

        updateShapeRotationX(shapeProps.rotationX);
        updateVertices(
            time,
            shapeProps.spikeAmount,
            shapeProps.perlinAmount
        );

        updateScale(shapeProps.scale);

        updateSceneMaterialsOpacity(shapeProps.o1, shapeProps.o2, shapeProps.o3, shapeProps.o4);
        updateSceneColors(0);
        updateBlur(0, 0);

        if (geometryRef.current) {
            geometryRef.current.attributes.position.needsUpdate = true;
        }

        composer.render(clockRef.current.getDelta());

        requestRef.current = requestAnimationFrame((time) => animate(time, composer, scene, camera, shapeProps));
    };

    return <canvas className={"h-screen w-screen"} ref={canvasRef}/>;
}


// [0, 1]
function quadratic(s: number, softness: number, spread: number, offset: number) { // -10x^​2 +1
    let x = s - offset;
    return softness * x * x + spread * x + 1;
}


// [-1, 1]
function sigmoid(t: number) {
    return 1 / (1 + Math.exp(-t));
}



