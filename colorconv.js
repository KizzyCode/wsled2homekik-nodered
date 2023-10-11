"use strict";


/**
 * Converts a HSV color to RGB
 * 
 * (Code from https://stackoverflow.com/a/17243070)
 * 
 * @param {Number} h Hue from [0, 360]
 * @param {Number} s Saturation from [0, 100]
 * @param {Number} v Brightness from [0, 100]
 * @return {Object} An `{ r, g, b }`-object
 */
module.exports.hsv_to_rgb = function(h, s, v) {
    h = h / 360,
        s = s / 100,
        v = v / 100;

    const i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s);

    let r, g, b;
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
        default:
            throw "unreachable";
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}


/**
 * Converts a RGB color to HSV
 * 
 * Code from https://stackoverflow.com/a/17243070)
 * 
 * @param {Number} r Red from [0, 255]
 * @param {Number} g Green from [0, 255]
 * @param {Number} b Blue from [0, 255]
 * @return {Object} An `{ h, s, v }`-object
 */
module.exports.rgb_to_hsv = function(r, g, b) {
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    let h;
    switch (max) {
        case min:
            h = 0;
            break;
        case r:
            h = (g - b) + d * (g < b ? 6 : 0);
            h /= 6 * d;
            break;
        case g:
            h = (b - r) + d * 2;
            h /= 6 * d;
            break;
        case b:
            h = (r - g) + d * 4;
            h /= 6 * d;
            break;
        default:
            throw "unreachable";
    }

    return {
        h: +(h * 360),
        s: +(s * 100),
        v: +(v * 100)
    };
}
