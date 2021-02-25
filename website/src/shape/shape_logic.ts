import { GPU } from "gpu.js";


const gpu = new GPU(
    {mode: "cpu"}
    );

gpu.addFunction(sinoid as any);
gpu.addFunction(dot3 as any);
gpu.addFunction(fade as any);
gpu.addFunction(lerp as any);
gpu.addFunction(simplex3 as any);
gpu.addFunction(perlin3 as any);
gpu.addFunction(getSpikeValue as any);
gpu.addFunction(getPerlinValue as any);


export function getMainKernel(length: number, cpu: boolean) {
    return gpu.createKernel(function(vertices: number[][],
                                     configs: number[][],
                                     spikeAmount: number,
                                     perlinAmount: number,
                                     time: number) {

        const x = vertices[this.thread.x][0];
        const y = vertices[this.thread.x][1];
        const z = vertices[this.thread.x][2];

        const perlinValue = getPerlinValue(
            x,
            y,
            z,
            time);

        const activated = configs[this.thread.x][0];
        const period = configs[this.thread.x][1];
        const size = configs[this.thread.x][2];
        const spikesValue = getSpikeValue(activated, period, size, time);

        const totalAmountSet = perlinAmount + spikeAmount;
        const baseAmount = 1 - Math.min(totalAmountSet, 1);
        const normalisedPerlinAmount = Math.min(perlinAmount, perlinAmount / totalAmountSet);
        const normalisedSpikesAmount = Math.min(spikeAmount, spikeAmount / totalAmountSet);

        const value =
            baseAmount +
            perlinValue * normalisedPerlinAmount +
            spikesValue * normalisedSpikesAmount;

        return [
            x * value,
            y * value,
            z * value
        ];
    }, {
        precision: "single",
        tactic: "precision",
        useLegacyEncoder: true,
        constants: { gradP: gradP, perm: perm },
        output: [length]
    }) as any;
}


export function getPerlinKernel(length: number, ) {
    return gpu.createKernel(function(vertices: number[][],
                                     time: number) {

        const x = vertices[this.thread.x][0];
        const y = vertices[this.thread.x][1];
        const z = vertices[this.thread.x][2];

        const perlinValue = getPerlinValue(
            x,
            y,
            z,
            time);

        return [
            x * perlinValue,
            y * perlinValue,
            z * perlinValue
        ];
    }, {
        precision: "single",
        tactic: "precision",
        useLegacyEncoder: true,
        constants: { gradP: gradP, perm: perm },
        output: [length]
    }) as any;
}

function getSpikeValue(activated: number, period: number, size: number, time: number) {
    return (activated === 0 ? 0 : ((sinoid(time + 1000, period)) * size) * .3) + 1;
}

function getPerlinValue(x: number, y: number, z: number, time: number) {

    //     let s = 0.65;
    //     let r = time * 0.000025;
    //     let xin = (v[0] * s) + r;
    //     let yin = (v[1] * s) + r;
    //     let zin = (v[2] * s) + r;

    let s = 0.35;
    let r = time * 0.00002;
    // let s = 0.285;
    // let r = time * 0.000001;
    let xin = (x * s) + r;
    let yin = (y * s) + r;
    let zin = (z * s) + r;
    return simplex3(xin, yin, zin)/ 2 + 1;
}

function perlin3(x: number, y: number, z: number): number {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    let Z = Math.floor(z);

    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    // @ts-ignore
    const n000gElement = this.constants.gradP[X + this.constants.perm[Y + this.constants.perm[Z]]][0];
    // @ts-ignore
    const n000gElement1 = this.constants.gradP[X + this.constants.perm[Y + this.constants.perm[Z]]][1];
    // @ts-ignore
    const n000gElement2 = this.constants.gradP[X + this.constants.perm[Y + this.constants.perm[Z]]][2];
    const n000 = dot3(n000gElement, n000gElement1, n000gElement2, x, y, z);
    return n000;
    // // @ts-ignore
    // let n001g = this.constants.gradP[X + this.constants.perm[Y + this.constants.perm[Z + 1]]];
    // let n001 = dot3(n001g[0], n001g[1], n001g[2], x, y, z - 1);
    // // @ts-ignore
    // let n010g = this.constants.gradP[X + this.constants.perm[Y + 1 + this.constants.perm[Z]]];
    // let n010 = dot3(n010g[0], n010g[1], n010g[2], x, y - 1, z);
    // // @ts-ignore
    // let n011g = this.constants.gradP[X + this.constants.perm[Y + 1 + this.constants.perm[Z + 1]]];
    // let n011 = dot3(n011g[0], n011g[1], n011g[2], x, y - 1, z - 1);
    // // @ts-ignore
    // let n100g = this.constants.gradP[X + 1 + this.constants.perm[Y + this.constants.perm[Z]]];
    // let n100 = dot3(n100g[0], n100g[1], n100g[2], x - 1, y, z);
    // // @ts-ignore
    // let n101g = this.constants.gradP[X + 1 + this.constants.perm[Y + this.constants.perm[Z + 1]]];
    // let n101 = dot3(n101g[0], n101g[1], n101g[2], x - 1, y, z - 1);
    // // @ts-ignore
    // let n110g = this.constants.gradP[X + 1 + this.constants.perm[Y + 1 + this.constants.perm[Z]]];
    // let n110 = dot3(n110g[0], n110g[1], n110g[2], x - 1, y - 1, z);
    // // @ts-ignore
    // let n111g = this.constants.gradP[X + 1 + this.constants.perm[Y + 1 + this.constants.perm[Z + 1]]];
    // let n111 = dot3(n111g[0], n111g[1], n111g[2], x - 1, y - 1, z - 1);
    //
    // // Compute the fade curve value for x, y, z
    // let u = fade(x);
    // let v = fade(y);
    // let w = fade(z);
    //
    //
    // // Interpolate
    // return lerp(
    //     lerp(
    //         lerp(n000, n100, u),
    //         lerp(n001, n101, u), w),
    //     lerp(
    //         lerp(n010, n110, u),
    //         lerp(n011, n111, u), w),
    //     v);
}

export function simplex3(xin: number, yin: number, zin: number) {

    let F3 = 1 / 3;
    let G3 = 1 / 6;

    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let n3 = 0; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    let s = (xin + yin + zin) * F3; // Hairy factor for 2D
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let k = Math.floor(zin + s);

    let t = (i + j + k) * G3;
    let x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    let y0 = yin - j + t;
    let z0 = zin - k + t;

    let i1 = 0;
    let j1 = 0;
    let k1 = 0; // Offsets for second corner of simplex in (i,j,k) coords
    let i2 = 0;
    let j2 = 0;
    let k2 = 0; // Offsets for third corner of simplex in (i,j,k) coords

    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        } else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        } else {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
    } else {
        if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    let x1 = x0 - i1 + G3; // Offsets for second corner
    let y1 = y0 - j1 + G3;
    let z1 = z0 - k1 + G3;

    let x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    let y2 = y0 - j2 + 2 * G3;
    let z2 = z0 - k2 + 2 * G3;

    let x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    let y3 = y0 - 1 + 3 * G3;
    let z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i = i & 255;
    j = j & 255;
    k = k & 255;
    // @ts-ignore
    let gi0X = this.constants.gradP[i + this.constants.perm[j + this.constants.perm[k]]][0];
    // @ts-ignore
    let gi0Y = this.constants.gradP[i + this.constants.perm[j + this.constants.perm[k]]][1];
    // @ts-ignore
    let gi0Z = this.constants.gradP[i + this.constants.perm[j + this.constants.perm[k]]][2];
    // @ts-ignore
    let gi1X = this.constants.gradP[i + i1 + this.constants.perm[j + j1 + this.constants.perm[k + k1]]][0];
    // @ts-ignore
    let gi1Y = this.constants.gradP[i + i1 + this.constants.perm[j + j1 + this.constants.perm[k + k1]]][1];
    // @ts-ignore
    let gi1Z = this.constants.gradP[i + i1 + this.constants.perm[j + j1 + this.constants.perm[k + k1]]][2];
    // @ts-ignore
    let gi2X = this.constants.gradP[i + i2 + this.constants.perm[j + j2 + this.constants.perm[k + k2]]][0];
    // @ts-ignore
    let gi2Y = this.constants.gradP[i + i2 + this.constants.perm[j + j2 + this.constants.perm[k + k2]]][1];
    // @ts-ignore
    let gi2Z = this.constants.gradP[i + i2 + this.constants.perm[j + j2 + this.constants.perm[k + k2]]][2];
    // @ts-ignore
    let gi3X = this.constants.gradP[i + 1 + this.constants.perm[j + 1 + this.constants.perm[k + 1]]][0];
    // @ts-ignore
    let gi3Y = this.constants.gradP[i + 1 + this.constants.perm[j + 1 + this.constants.perm[k + 1]]][1];
    // @ts-ignore
    let gi3Z = this.constants.gradP[i + 1 + this.constants.perm[j + 1 + this.constants.perm[k + 1]]][2];

    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
        n0 = 0;
    } else {
        t0 *= t0;
        let gio0d = dot3(gi0X, gi0Y, gi0Z, x0, y0, z0);
        n0 = t0 * t0 * gio0d;  // (x,y) of grad3 used for 2D gradient
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
        n1 = 0;
    } else {
        t1 *= t1;
        let gi1d = dot3(gi1X, gi1Y, gi1Z, x1, y1, z1);
        n1 = t1 * t1 * gi1d;
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
        n2 = 0;
    } else {
        t2 *= t2;
        let gi2d = dot3(gi2X, gi2Y, gi2Z, x2, y2, z2);
        n2 = t2 * t2 * gi2d;
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
        n3 = 0;
    } else {
        t3 *= t3;
        let gi3d = dot3(gi3X, gi3Y, gi3Z, x3, y3, z3);
        n3 = t3 * t3 * gi3d;
    }
    // Add contributions from each corner to get the final noise value.
    return 32 * (n0 + n1 + n2 + n3);

}

function sinoid(t: number, period: number) {
    return Math.sin(t / period * (2 * Math.PI));
}

const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

let p = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

let perm = new Array(1024);
let gradP = new Array(512);

// This isn't a very good seeding function, but it works ok. It supports 2^16
// different seed values. Write something better if you need more seeds.
function seed(seed: number) {
    if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
        seed |= seed << 8;
    }

    for (let i = 0; i < 256; i++) {
        let v;
        if (i & 1) {
            v = p[i] ^ (seed & 255);
        } else {
            v = p[i] ^ ((seed >> 8) & 255);
        }

        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
}

seed(0);

function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
}

function dot3(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    return x0 * x1 + y0 * y1 + z0 * z1;
}
