/*
 * Project :WebGL Car Configurator
 * File: utilities.js
 * Description : Utility script with helper functions
 * Date : 10/09/2021
 * License : MIT
 * Author : RendercodeNinja
 * URL : https://github.com/RendercodeNinja
 */

import { Color, Euler } from "three";

// Color Utility methods
export const ColorUtils = {

    //Convert web color format to hex color format (with Gamma correction)
    webColorToHex: (webColor) => {

        //Convert web color to hex base
        const hex = parseInt(webColor.replace("#", "0x"));

        //Construct color from hex with Gamma Correction
        return new Color(hex).convertSRGBToLinear();
    }
}

//Network Utility methods
export const NetworkUtils = {

    //Fetches meta json at provided URL
    fetchMeta: (path, onSuccess) => {

        //Create an XML request
        var xhr = new XMLHttpRequest();
        //Set response type to json
        xhr.responseType = 'json';
        //Open metal url
        xhr.open('GET', `${path}meta.json`, true);

        //Load the url using xhr
        xhr.onload = () => {

            //Throw success if response available and status OK
            if (xhr.status == 200 && xhr.response != null)
                onSuccess(xhr.response)
            //Else throw error
            else
                console.error('Error occurred loading meta JSON. Probably invalid JSON format.');
        }

        //Execute the xhr request
        xhr.send(null);
    }
}

//Custom Math Utility methods
export const MathUtils = {

    coordR2L: (point) => {

        //Swap Y and Z with Z=-Y
        return { x: point.x, y: point.z, z: -point.y };
    },

    vector3DegToRadian: (point) => {
        //The per degree converter
        var degree = Math.PI / 180;
        //Return the new vector3 in radian
        return new Euler(point.x * degree, point.y * degree, point.z * degree, 'XYZ');
    }
}

//HTML Animation Utility methods
export const AnimUtils = {

    //Fade in an HTML element by duration
    fadeElementIn: (element, duration = 500, options = { display: 'block' }, callback) => {

        //Ignore if element not available
        if (!element)
            return;

        //Set style to visible/display for opacity to apply
        element.style.display = options.display;
        element.style.visibility = "visible";
        element.style.opacity = 0;
        element.style.filter = "alpha(opacity=0)";

        //Set initial opacity to 0
        var opacity = 0;

        //Timed recurring
        var timer = setInterval(() => {

            //Increment opacity linear
            opacity += 50 / duration;

            //Exit timer on max opacity
            if (opacity >= 0.95) {

                //Clear timer
                clearInterval(timer);

                //Set final values
                opacity = 1;

                //Invoke callback with element;
                if (callback) callback(element)
            }

            //Apply updated opacity
            element.style.opacity = opacity;
            element.style.filter = "alpha(opacity=" + opacity * 100 + ")";

        }, 50);
    },

    //Fade out an HTML element by duration
    fadeElementOut: (element, duration = 500, callback) => {

        //Ignore if element not available
        if (!element)
            return;

        //Opacity
        let opacity = 1;

        //Timer function
        let timer = setInterval(() => {

            //Decrement opacity linear
            opacity -= 50 / duration;

            //Exit timer on min opacity
            if (opacity <= 0) {

                //Clear timer
                clearInterval(timer);

                //Set final values
                opacity = 0;
                element.style.display = "none";
                element.style.visibility = "hidden";

                //Invoke callback with element;
                if (callback)
                    callback(element);
            }

            //Apply updated opacity
            element.style.opacity = opacity;
            element.style.filter = "alpha(opacity=" + opacity * 100 + ")";

        }, 50);
    },

    //Fades in volume of an audio element
    fadeAudioIn: (audio, duration = 1000, options = { max: 1 }, callback) => {

        //Ignore if audio not available
        if (!audio)
            return;

        //Set start volume
        let vol = 0;

        //Reset volume
        audio.volume = vol;
        //Start if not playing
        if (audio.paused) audio.play();

        //Timer function
        let timer = setInterval(() => {

            //Increment volume linear
            vol += 50 / duration;

            if (vol >= options.max) {

                //Clear timer
                clearInterval(timer);

                //Set final values
                vol = options.max;

                //Invoke callback with element;
                if (callback) callback(audio)
            }

            //Apply updated volume
            audio.volume = vol;

        }, 50)
    },

    //Fades out volume of an audio element
    fadeAudioOut: (audio, duration = 1000, callback) => {

        //Ignore if audio not available
        if (!audio)
            return;

        //Get start volume
        let vol = audio.volume;

        //Timer function
        let timer = setInterval(() => {

            //Decrement volume linear
            vol -= 50 / duration;

            if (vol <= 0) {

                //Clear timer
                clearInterval(timer);
                //Set final values
                vol = 0;

                //Invoke callback with audio element;
                if (callback) callback(audio);
            }

            //Apply updated volume
            audio.volume = vol;

        }, 50);

    }
}
