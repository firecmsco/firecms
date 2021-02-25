import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// @ts-ignore
import { BlurPass, EffectComposer, RenderPass } from "postprocessing";

// @ts-ignore
import * as Perlin from "perlin";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { noise } from "./perlin3";
import { getPerlinKernel } from "./shape_logic";

const WHITE = new THREE.Color(0xFFFFFF),
    GREY = new THREE.Color(0xCCCCCC),
    RED = new THREE.Color(0xFF0000),
    YELLOW = new THREE.Color(0xFFFF00),
    BLUE = new THREE.Color(0x0000FF),
    LIGHT_GREEN = new THREE.Color(0x70C4CE),
    ORANGE = new THREE.Color(0xf66023),
    PURPLE = new THREE.Color(0x590D82),
    MAGENTA = new THREE.Color(0xff00ff),
    PINK = new THREE.Color(0xCE70A5);


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


export function ThreeJSAnimation(props: ShapeProps) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    let uniforms = THREE.UniformsUtils.merge(
        [
            {
                "time": { value: 1.0 }
            }
        ]
    );


    function initScene(width: number, height: number) {

        const scene = new THREE.Scene();

        // let geometry = new THREE.PlaneGeometry( SHAPE_RADIUS, SHAPE_RADIUS, 5 );
        let geometry = new THREE.DodecahedronGeometry(3, 15);

        // let geometry = new THREE.BoxGeometry( 0.75, 0.75, 0.75 );
        console.log("pointsCount prev", geometry.attributes.position.array.length);
        // let geometry = new THREE.PlaneGeometry(400, 400, 100, 100);
        // delete geometry.attributes.normal;
        // delete geometry.attributes.uv;
        geometry = BufferGeometryUtils.mergeVertices(geometry);
        console.log("pointsCount", geometry.attributes.position.array.length);

        const pointsCount = geometry.attributes.position.array.length / 3;
        const originalVertices: THREE.Vector3[] = [];
        for (let i = 0; i < pointsCount; i++) {
            const vector = new THREE.Vector3();
            vector.fromBufferAttribute(geometry.attributes.position, i);
            originalVertices.push(vector);
        }


        // const material = new THREE.ShaderMaterial({
        //     uniforms: uniforms,
        //     vertexShader: buildVertexShader(),
        //     fragmentShader: buildFragmentShader(),
        //     lights: true
        // });


        // const material = new THREE.MeshStandardMaterial({
        const material = new THREE.MeshLambertMaterial({
            color: WHITE,
            // emissiveIntensity: .8,
            // vertexColors: true,
            // fog: true
        });
        const planeMaterial = new THREE.MeshLambertMaterial({
            emissive: BLUE,
            emissiveIntensity: .8,
            // vertexColors: true,
            // fog: true
        });
        // material.wireframe = true;

        // material.onBeforeCompile = function( shader ) {
        //     console.log(THREE.MeshLambertMaterial);
        //     // shader.vertexShader = THREE.MeshLambertMaterial.vertexShader;
        //
        // };


        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);
        shape.position.x = -1;
        shape.position.y = -1;

        // const geometryPlane = new THREE.BoxGeometry( 0.75, 0.75, 0.75 );
        //
        // const uniforms = {
        //     time: { value: 1.0 }
        // };
        //
        // const materialPlane = new THREE.ShaderMaterial( {
        //
        //     uniforms: uniforms,
        //     vertexShader: buildVertexShader(),
        //     fragmentShader: buildFragmentShader()
        //
        // } );
        //
        // const mesh = new THREE.Mesh( geometryPlane, materialPlane );
        // scene.add( mesh );
        // BG plane
        const planeGeometry = new THREE.PlaneGeometry(500, 500, 1);
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = -10;
        scene.add(plane);

        const light = new THREE.HemisphereLight(WHITE, RED, .5);
        light.position.set(0, 0, 10);
        // light.target.position.set(shape);
        scene.add(light);

        const light2 = new THREE.DirectionalLight(RED, .3);
        light2.position.set(-4, -3, 5);
        scene.add(new THREE.DirectionalLightHelper(light2, 1));
        // scene.add(light2);

        const light3 = new THREE.DirectionalLight(BLUE, .5);
        light3.position.set(-5, 0, 0);
        scene.add(new THREE.DirectionalLightHelper(light3, 1));
        scene.add(light3);

        const light4 = new THREE.DirectionalLight(WHITE, .3);
        light4.position.set(3, 3, 2);
        scene.add(new THREE.DirectionalLightHelper(light4, 1));
        scene.add(light4);

        const light5 = new THREE.DirectionalLight(RED, .5);
        light5.position.set(3, -2, 9);
        scene.add(new THREE.DirectionalLightHelper(light5, 1));
        scene.add(light5);

        return {
            scene,
            geometry,
            shape,
            originalVertices,
            light,
            light2,
            light3,
            light4,
            light5
        };
    }


    function updateLightsPosition(time: number, light: THREE.HemisphereLight, light2: THREE.DirectionalLight, light4: THREE.DirectionalLight, light5: THREE.DirectionalLight, shape) {
        const LIGHT_DISTANCE = 6;

        const sin = Math.sin(time / 5000) * LIGHT_DISTANCE;
        const cos = Math.cos(time / 5000) * LIGHT_DISTANCE;

        // light.position.set(
        //     Math.cos(time / 5000) * LIGHT_DISTANCE,
        //     0,
        //     Math.sin(time / 5000) * LIGHT_DISTANCE
        // );
        light2.position.set(
            - cos,
            2,
            sin
        );
        // light2.target.position.set(shape);

        light4.position.set(
            sin,
            -cos,
            0
        );
        // light4.target.position.set(shape);
        light5.position.set(
            -1,
            cos,
            5
        );
        // light5.target.position.set(shape);
    }

    function initRenderer(ref: HTMLCanvasElement, width: number, height: number, scene: THREE.Scene, camera: THREE.Camera) {

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            // alpha: true,
            canvas: ref
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const blurPass = new BlurPass();
        blurPass.renderToScreen = true;
        blurPass.resolutionScale = .5;
        composer.addPass(blurPass);

        blurPass.enabled = false;
        renderPass.renderToScreen = true;

        return composer;
    }

    function updateVerticesJs(geometry: THREE.BufferGeometry, verticesMatrix: [number, number, number][] , time: number) {

        const jsUpdatedVectors: [number, number, number][] = verticesMatrix.map((v) => {
            let s = 0.65;
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
            // console.log("jsUpdatedVectors", jsUpdatedVectors);
        }

        if (geometry) {
            jsUpdatedVectors.forEach((value, i) => {
                geometry.attributes.position.array[i * 3] = value[0];
                geometry.attributes.position.array[i * 3 + 1] = value[1];
                geometry.attributes.position.array[i * 3 + 2] = value[2];
            });
            geometry.attributes.position.needsUpdate = true;
        }
    }

    function updateVertices(geometry: THREE.BufferGeometry, calculateShapeVectors: any, verticesMatrix, time: number) {

        const updatedVectors: [number, number, number][] =
            calculateShapeVectors(
                verticesMatrix,
                time + 10000) as [number, number, number][];


        if (time < 2000) {
            console.log("verticesMatrix", verticesMatrix);
            // console.log("jsUpdatedVectors", jsUpdatedVectors);
        }

        if (geometry) {
            updatedVectors.forEach((value, i) => {
                geometry.attributes.position.array[i * 3] = value[0];
                geometry.attributes.position.array[i * 3 + 1] = value[1];
                geometry.attributes.position.array[i * 3 + 2] = value[2];
            });
            geometry.attributes.position.needsUpdate = true;
        }
    }


    useEffect(() => {

        if (!canvasRef.current)
            return;

        const width = canvasRef.current.offsetWidth,
            height = canvasRef.current.offsetHeight;

        const {
            scene,
            geometry,
            originalVertices,
            shape,
            light,
            light2,
            light3,
            light4,
            light5
        } = initScene(width, height);

        const cameraFactor = 200;
        const camera = new THREE.OrthographicCamera(width / -cameraFactor, width / cameraFactor, height / cameraFactor, height / -cameraFactor, 1, 30);
        // const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 10;

        const clock = new THREE.Clock();

        const renderer = initRenderer(canvasRef.current, width, height, scene, camera);


        const calculateShapeVectors = getPerlinKernel(originalVertices.length);
        const verticesMatrix: [number, number, number][] = originalVertices.map((v) => [v.x, v.y, v.z]);

        const animate = (time) => {

            // updateVerticesJs(geometry, verticesMatrix, time);
            updateVertices(geometry, calculateShapeVectors, verticesMatrix, time);
            updateLightsPosition(time, light, light2, light4, light5, shape);

            const delta = clock.getDelta();
            uniforms["time"].value += delta * 5;

            shape.rotation.y += delta * 0.05 * (1);
            shape.rotation.x += delta * 0.05 * (-1);

            renderer.render(scene, camera);

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            // Callback to cleanup three js, cancel animationFrame, etc
        };
    }, [canvasRef.current]);

    return <canvas
        className={"h-screen w-screen"}
        ref={canvasRef}/>;

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


function buildVertexShader() {
    return `
			#define LAMBERT

			// instanced
			attribute vec3 instanceOffset;
			attribute vec3 instanceColor;
			attribute float instanceScale;

			varying vec3 vLightFront;
			varying vec3 vIndirectFront;

			#ifdef DOUBLE_SIDED
				varying vec3 vLightBack;
				varying vec3 vIndirectBack;
			#endif

			#include <common>
			#include <uv_pars_vertex>
			#include <uv2_pars_vertex>
			#include <envmap_pars_vertex>
			#include <bsdfs>
			#include <lights_pars_begin>
			#include <color_pars_vertex>
			#include <fog_pars_vertex>
			#include <morphtarget_pars_vertex>
			#include <skinning_pars_vertex>
			#include <shadowmap_pars_vertex>
			#include <logdepthbuf_pars_vertex>
			#include <clipping_planes_pars_vertex>

			void main() {

				#include <uv_vertex>
				#include <uv2_vertex>
				#include <color_vertex>

				// vertex colors instanced
				#ifdef USE_COLOR
					vColor.xyz = instanceColor.xyz;
				#endif

				#include <beginnormal_vertex>
				#include <morphnormal_vertex>
				#include <skinbase_vertex>
				#include <skinnormal_vertex>
				#include <defaultnormal_vertex>

				#include <begin_vertex>

				// position instanced
				transformed *= instanceScale;
				transformed = transformed + instanceOffset;

				#include <morphtarget_vertex>
				#include <skinning_vertex>
				#include <project_vertex>
				#include <logdepthbuf_vertex>
				#include <clipping_planes_vertex>

				#include <worldpos_vertex>
				#include <envmap_vertex>
				#include <lights_lambert_vertex>
				#include <shadowmap_vertex>
				#include <fog_vertex>

			}
			`;
}

function buildFragmentShader() {
    return `
			uniform float time;

			varying vec2 vUv;

			void main( void ) {

				vec2 position = - 1.0 + 1.0 * vUv;

				float red = abs( sin( position.x * position.y + time / 5.0 ) );
				float green = abs( sin( position.x * position.y + time / 4.0 ) );
				float blue = abs( sin( position.x * position.y + time / 3.0 ) );
				gl_FragColor = vec4( red, green, blue, 1.0 );

			}
        `;
}

function buildNoiseShader() {
    return `

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Include the Ashima code here!

varying vec2 vUv;
varying float noise;

float turbulence( vec3 p ) {
    float w = 100.0;
    float t = -.5;
    for (float f = 1.0 ; f <= 10.0 ; f++ ){
        float power = pow( 2.0, f );
        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
    }
    return t;
}

void main() {

    vUv = uv;

    noise = 10.0 *  -.10 * turbulence( .5 * normal );
    float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
    float displacement = - 10. * noise + b;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
        `;
}

