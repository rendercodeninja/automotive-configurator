/*
 * Project :WebGL Car Configurator
 * File: app.js
 * Description : Entry main file for app
 * Date : 10/09/2021
 * License : MIT
 * Author : Sethu Raj
 * URL : https://github.com/EverCG
 */

import $ from 'jquery';
import BaseEngine from "./baseEngine";
import { CameraController } from "./cameraController";
import { ACTIVE_PATH, GIT_URL } from "./config";
import { Interface } from './inteface';
import { SceneManager } from './sceneManager';
import { AnimUtils, NetworkUtils } from "./utilities";

//App Class
class App extends BaseEngine {

    //App Constructor
    constructor() {

        //Base class constructor
        super();

        //Whether any load error set
        this.loadErrorSet = false;
        //Whether demo started
        this.demoStarted = false;

        //Meta configuration object
        this.meta = {};

        //Load the Audio track
        this.audioTrack = new Audio('assets/audio_track.mp3');
        this.audioTrack.volume = 0;

        //Create camera controller
        this.cameraController = new CameraController(this.renderer, window.innerWidth / window.innerHeight);
        //Initialize SceneManager
        SceneManager.init(this.manager);

        //Event listener  - Loading Manager Progress
        this.manager.onProgress = this.onLoadProgress.bind(this);
        //Event listener  - Loading Manager Error
        this.manager.onError = this.onLoadError.bind(this);
        //Event listener  - Loading Manager Completed
        this.manager.onLoad = this.onLoadCompleted.bind(this);

        //Event Listener - Window resize
        window.addEventListener('resize', this.onContextResized.bind(this), true);
        //Event Listener - Start Demo Button Click
        $('#btn-start-demo')[0].addEventListener('click', this.startDemo.bind(this));
        //Event Listener  - Skip Intro button click
        $('#btn-skip-intro')[0].addEventListener('click', this.skipIntro.bind(this));
        //Event Listener - Cinematic shots completed
        this.cameraController.setOnCineComplete(this.skipIntro.bind(this));

        //Event Listener - Entity color change
        Interface.setOnEntityColor(SceneManager.setEntityColor);
        //Event Listener - Entity visibility change
        Interface.setOnEntityVisible(SceneManager.setEntityVisible);

        //Intialize the scene
        this.setupScene();

        //Recalculate context
        this.onContextResized();

        //Start update routine
        this.update();
    }

    //Initialize the configurator scene
    setupScene() {

        //Load the stage model
        SceneManager.loadStage(this.scene);

        //Load the Active model post meta data fetch
        NetworkUtils.fetchMeta(ACTIVE_PATH, meta => {

            //Get reference to the meta
            this.meta = meta;

            //Load the Active model through model manager
            SceneManager.loadActiveModel(this.scene, this.meta)
        })
    }

    //Event - LoaderManager error
    onLoadError(item) {

        //Remove Loader Icon
        $('#preloader .icon').remove();
        //Display load error
        $('#preloader .title').text("ERROR LOADING");
        //Display the load error item
        $('#preloader .desc').text(item);

        //Set error flag
        this.loadErrorSet = true;
    }

    //Event - LoaderManager progress
    onLoadProgress(item, loaded, total) {

        //Ignore if any load error occured
        if (this.loadErrorSet)
            return;

        //Update preloader description with error item name
        $('#preloader .desc').text(item);
    }

    //Event - LoaderManager finished
    onLoadCompleted() {

        //Ignore if any load error occured
        if (this.loadErrorSet)
            return;

        //Update preloader content
        $('#preloader .icon').remove();
        $('#preloader .title').text('Automotive Configurator');
        $('#preloader .desc').html('A ThreeJS based car configurator. This app is intented for demo purposes only.');
        $('#preloader .btn-main').show();
    }

    //Event - Render context resized
    onContextResized() {

        //Set new renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //Set new camera projection
        this.cameraController.setAspect(window.innerWidth / window.innerHeight);
    }

    //Method - Start the demo with cinematic sequence
    startDemo() {

        //Ignore if any load error set or demo already started
        if (this.loadErrorSet || this.demoStarted) return;

        //State demo started
        this.demoStarted = true;

        //Fade Out Preloader
        AnimUtils.fadeElementOut($('#preloader')[0], 900, element => {

            //Remove Preloader element
            element.remove();

            //Fade In Welcome screen
            AnimUtils.fadeElementIn($('#welcome-screen')[0], 900, { display: 'flex' });
        });

        //Start cinematic shots seuqnce
        this.cameraController.startCinematic();

        //Start audio track with fade-in the audio
        AnimUtils.fadeAudioIn(this.audioTrack, 2000, { max: 0.5 })
    }

    //Skip cinematic intro
    skipIntro() {

        //Fade Audio Track and remove
        AnimUtils.fadeAudioOut(this.audioTrack, 2000, audio => audio.remove());

        //Start fading in the screen
        AnimUtils.fadeElementIn($('#screen-fader')[0], 900, { display: 'flex' }, (fader) => {

            //Stop the cinematic camera movement
            this.cameraController.stopCinematic();
            //Set orbit camera as current camera
            this.cameraController.mainCamera = this.cameraController.orbitCamera;
            //Set new camera projection
            this.cameraController.setAspect(window.innerWidth / window.innerHeight);
            //Remove the welcome screen
            $('#welcome-screen').remove();
            //Initialize configurator interface
            Interface.initialize(this.meta);
            //Fade out screen fader
            AnimUtils.fadeElementOut(fader, 900);
            //Fade In Github Authoring
            AnimUtils.fadeElementIn($('#app-authoring')[0], 900)
        })
    }

    //App Update
    update() {

        //Parent
        super.update();
        //Update Camera Controller
        this.cameraController.update();
        //Render scene through main camera
        this.renderer.render(this.scene, this.cameraController.mainCamera)
        //Request updation to next frame
        requestAnimationFrame(this.update.bind(this));
    }
}

export default new App();
