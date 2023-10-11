const colorconv = require("./colorconv");


/**
 * Translates a HomeKit light bulb state into a WS2812B compatible state
 * @param {*} msg The message to translate
 * @param {*} config The nodeRED config object
 */
function ws2812b(msg, config) {
    // Get config values
    const offset = parseInt(config.offset);
    const count = parseInt(config.count);

    // Special-case handling of state `"On" === false`
    if (msg.payload.hasOwnProperty("On") && !msg.payload["On"]) {
        // Build a payload that sets all configured pixels to "off"
        const all_off = [];
        for (let index = 0; index < count; index++) {
            // Push RGBW 0000 to turn the pixel off
            all_off.push({ pixel: offset + index, rgbw: [0,0,0,0] });
        }

        // Return the all-off payload
        return { payload: all_off }
    } else {
        // Get values
        let hue = msg.payload["Hue"] ?? msg.hap.allChars["Hue"];
        let saturation = msg.payload["Saturation"] ?? msg.hap.allChars["Saturation"];
        let brightness = msg.payload["Brightness"] ?? msg.hap.allChars["Brightness"];
        
        // Translate colors
        const { r, g, b } = colorconv.hsv_to_rgb(hue, saturation, brightness);
        const rgbw = [];
        for (let index = 0; index < count; index++) {
            // Push RGBW 0000 to turn the pixel off
            rgbw.push({ pixel: offset + index, rgbw: [r,g,b,0] });
        }
        return { payload: rgbw };
    }
}


module.exports = function(RED) {
    function homekit2wsled(config) {
        // Create the node
        RED.nodes.createNode(this, config);
        
        // Register the on-"input"-handler
        this.on("input", function(msg, send, done) {
            try {
                // The translator functions for the different LED kinds
                const translators = {
                    "WS2812B": ws2812b
                };

                // Select the appropriate mapper
                const selected = translators[config.kind];
                if (selected === undefined) {
                    throw "Invalid LED kind: " + config.kind;
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
    RED.nodes.registerType("homekit to wsled", homekit2wsled);
}
