const colorconv = require("./colorconv");


/**
 * Translates a WS2812B state into a HomeKit compatible state
 * @param {*} msg The message to translate
 * @param {*} config The nodeRED config object
 */
function ws2812b(msg, config) {
    // Get config values
    const offset = parseInt(config.offset);
    const count = parseInt(config.count);

    // Flatten the state to an indexed map
    let state = Array(4096).fill([0,0,0,0]);
    for (const pixelState of msg.payload) {
        // Get the pixel and RGBW state for each state object
        if (pixelState.hasOwnProperty("pixel") && pixelState.hasOwnProperty("rgbw")) {
            state[pixelState["pixel"]] = pixelState["rgbw"];
        }
    }

    // Create a fancy average over all LEDs
    let rgb = { r: 0, g: 0, b: 0 };
    for (let index = 0; index < count; index++) {
        // Sum everything up
        const [ r, g, b, _ ] = state[offset + index];
        rgb.r += r;
        rgb.g += g;
        rgb.b += b;
    }
    // Build average
    rgb.r = Math.round(rgb.r / count);
    rgb.g = Math.round(rgb.g / count);
    rgb.b = Math.round(rgb.b / count);

    // Special handling of RGB 000
    if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
        // Return a simple off-payload
        const payload = { "On": false };
        return { payload: payload };
    } else {
        // Return HSV
        const { h, s, v } = colorconv.rgb_to_hsv(rgb.r, rgb.g, rgb.b);
        const payload = { "Hue": Math.round(h), "Saturation": Math.round(s), "Brightness": Math.round(v) };
        return { payload: payload };
    }
}


module.exports = function(RED) {
    function wsled2homekit(config) {
        // Create the node
        RED.nodes.createNode(this, config);
        
        // Register the on-"input"-handler
        this.on("input", function(msg, send, done) {
            try {
                // The translator functions for the different device kinds
                const translators = {
                    "WS2812B": ws2812b,
                };

                // Select the appropriate mapper
                const selected = translators[config.kind];
                if (selected === undefined) {
                    throw "Invalid device kind: " + config.kind;
                }

                // Call the appropriate mapper and finish the flow
                const result = selected(msg, config);
                send(result);
                done();
            } catch (e) {
                // Propagate error to node red
                done(e);
            }
        });
    }
    RED.nodes.registerType("wsled to homekit", wsled2homekit);
}
