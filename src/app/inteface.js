/*
 * Project :WebGL Car Configurator
 * File: interface.js
 * Description : Handles configurator interface in 2D space
 * Date : 10/09/2021
 * License : MIT
 * Author : RendercodeNinja
 * URL : https://github.com/RendercodeNinja
 */

import $ from 'jquery';

//Configurator Palette HTML Layout
const PALETTE_HTML = $(`<div class="config-palette">

        <div class="config-palette__wrapper">

            <ul class="config-tab__list">

                <li>
                    <a class="config-tab" data-id="body_colors">
                        <span>BODY COLOR</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="mirror_colors">
                        <span>SIDE MIRRORS</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="wheel_designs">
                        <span>WHEELS</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="wheel_colors">
                        <span>WHEEL COLOR</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="caliper_colors">
                        <span>CALIPERS</span>
                    </a>
                </li>

            </ul>

            <div class="config-options__wrap">
                <div id="body_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="mirror_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="wheel_designs" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="wheel_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="caliper_colors" class="config-options">
                    <ul>
                    </ul>
                </div>
            </div>
        </div>
     </div>`);

//Singleton Interface Pattern
export const Interface = (() => {

    //Meta data local reference
    let metaData = {};
    //Current Body Color
    let cBodyColor;
    //Current MirrorCover Color
    let cOVRMColor;

    //Callback - Entity Color Change
    let cbOnEntityColor = (target, color) => void 0;
    //Callback  - Entity Visibility Change
    let cbOnEntityVisible = (target) => void 0;

    //Method - Append texture swatches for selected container
    const appendTextureSwatches = (container, config, cb) => {

        //Empty the container
        $(container).empty();

        //Iterate through each available design
        config.designs.forEach(design => {

            //Compose thumb image url from meta
            const url = `assets/aventador/${design.thumb}.png`;
            //Compose the swatch element
            const swatch = $(`<li><button class="texture-swatch"><span>${design.name}</span></button></li>`)
            //Apply image as button background
            $('button', swatch).css({ 'background-image': 'url(' + url + ')' });
            //Bind click callback for swatch
            $('button', swatch).on('click', ((e) => { return () => cb(e) })(design.value));
            //Add the texture swatch to target container
            $(container.append(swatch));
        })

    }

    //Method - Append color swatches for selected container
    const appendColorSwatches = (container, config, def, cb) => {

        //Empty the container
        $(container).empty();

        //Get the color array
        var colorList = config.colors.slice(0);

        //If default color available
        if (def)
            colorList.unshift({ "name": "Current", "value": def });

        //Iterate through each available colors
        colorList.forEach(color => {

            //Compose the swatch element
            const swatch = $(`<li><button class="color-swatch"><span>${color.name}</span></button></li>`)
            //Set the swatch color
            $('button', swatch).css({ "background": color.value });
            //Bind click callback for swatch
            $('button', swatch).on('click', ((e, c) => { return () => cb(e, c) })(config.target, color.value));

            //Add the color swatch to target container
            $(container).append(swatch);
        })
    }

    //Event - Configuration Tab Clicked
    const onConfigTabClicked = (item) => {

        //Get the target tab
        const target = $(item.currentTarget)
        //Get target tab Id
        const tabId = target.data('id');

        //If the palette is already active
        if (target.hasClass("active")) {

            //Empty the container
            $(`#${tabId} > ul`, PALETTE_HTML).empty();
            //Remove active and return
            return target.removeClass('active');
        }

        //Deactivate all config tab links
        $('.config-tab', PALETTE_HTML).removeClass('active');
        //Hide all config tab contents
        $('.config-options', PALETTE_HTML).hide();


        //Get the target container for swatches
        const container = $(`#${tabId} > ul`, PALETTE_HTML);

        //Add object/texture swatch if wheel design
        if (tabId == 'wheel_designs') {
            appendTextureSwatches(container, metaData[tabId], (target) => {

                //Return if callback not hooked
                if (!cbOnEntityVisible) return;

                //Invoke callback
                cbOnEntityVisible(target);

            })
        }
        //Add the color swatches
        else {
            appendColorSwatches(container, metaData[tabId], (tabId === 'mirror_colors') ? cBodyColor : null, (target, color) => {

                //Return if callback not hooked
                if (!cbOnEntityColor) return;

                //Invoke callback (For target)
                cbOnEntityColor(target, color);

                //Cache OVRM color if target
                if (target == 'Mt_MirrorCover') cOVRMColor = color;

                //If Body color is target
                if (target == 'Mt_Body') {

                    //Cache new body color
                    cBodyColor = color;

                    //If OVRM color is not custom, apply body color to OVRM also
                    if (metaData.mirror_colors.colors.filter(e => e.value === cOVRMColor).length === 0)
                        cbOnEntityColor('Mt_MirrorCover', color);
                }
            })
        }

        //Set the current clicked tab active
        $(`.config-tab[data-id=${tabId}]`, PALETTE_HTML).addClass("active");
        //Show the active config palette content
        $(`#${tabId}`, PALETTE_HTML).show();
    }

    //Method - Initialize Interface
    const initialize = (meta) => {

        //Cache meta data
        metaData = meta;

        //Cache default body color
        cBodyColor = meta.body_colors.colors[meta.body_colors.default].value;
        //Cache default OVRM color
        cOVRMColor = meta.mirror_colors.colors[meta.mirror_colors.default].value;

        //Append the Configurator palette to body
        $('body').append(PALETTE_HTML);

        //Bind Event - Tab item clicked
        $('.config-tab', PALETTE_HTML).on('click', onConfigTabClicked);
    }

    //Set Callback - Entity Color Change
    const setOnEntityColor = (cb) => cbOnEntityColor = cb;
    //Set Callback - Entity Visibility Change
    const setOnEntityVisible = (cb) => cbOnEntityVisible = cb;

    //Return Public Methods/Properties
    return { initialize, setOnEntityColor, setOnEntityVisible }

})();