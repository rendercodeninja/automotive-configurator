/*
 * Project :WebGL Car Configurator
 * File: cameraController.js
 * Description : Custom controller for cinematic and orbit camera
 * Date : 10/09/2021
 * License : MIT
 * Author : RendercodeNinja
 * URL : https://github.com/RendercodeNinja
 */

import * as TWEEN from '@tweenjs/tween.js';
import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MathUtils } from './utilities';

//The camera startup position
const ORBIT_CAM_POS = new Vector3(-27, 5, 10);
//The camera lookAt target
const ORBIT_CAM_TARGET = new Vector3(0, 3, 0);

//The cinematic sequence position array
const CINE_SEQUENCE_POINTS =
    [
        {
            sP: { x: -28, y: -26, z: 3.5 },
            eP: { x: -25, y: -23, z: 3.5 },
            cR: { x: 0.0, y: -45, z: 5.0 },
            tD: 9500
        },
        {
            sP: { x: -18, y: 0, z: 2.5 },
            eP: { x: -18, y: 0, z: 5.5 },
            cR: { x: 0.0, y: -90, z: 0.0 },
            tD: 5000
        },
        {
            sP: { x: -13.50, y: -3.75, z: 3.75 },
            eP: { x: -12.00, y: -5.50, z: 4.50 },
            cR: { x: -41.79, y: -42.36, z: -19.55 },
            tD: 7000
        },
        {
            sP: { x: -10.50, y: -8.0, z: 1.50 },
            eP: { x: -14.00, y: -12.0, z: 1.00 },
            cR: { x: 10.12, y: -43.88, z: -7.06 },
            tD: 7000
        },
        {
            sP: { x: -13, y: -14, z: 14 },
            eP: { x: 11, y: -14, z: 14 },
            cR: { x: -38.28, y: 0.0, z: 0.0 },
            tD: 12000
        },
        {
            sP: { x: 12.85, y: -1.0, z: 4.35 },
            eP: { x: 12.85, y: 0.70, z: 4.35 },
            cR: { x: 47.34, y: 50.53, z: -33.90 },
            tD: 7000
        },
        {
            sP: { x: 13, y: -4.5, z: 2.5 },
            eP: { x: 13, y: -4.5, z: 5.0 },
            cR: { x: 0, y: 58, z: 5.35 },
            tD: 7000
        },
        {
            sP: { x: -3.3, y: -6.5, z: 5.0 },
            eP: { x: 1.2, y: -6.5, z: 5.35 },
            cR: { x: -30.65, y: -55.53, z: -1.88 },
            tD: 5000
        },
        {
            sP: { x: -13.85, y: -0.35, z: 3.15 },
            eP: { x: -14.50, y: -1.1, z: 3.75 },
            cR: { x: -35.54, y: -35.16, z: -15.17 },
            tD: 8000
        }
    ];

export class CameraController {

    //Class constructor
    constructor(renderer, aspect) {

        //Callback Handler - OnCineComplete
        this.onCineComplete = () => void 0;

        //Array to keep all cinematic shot tweens
        this.mCineShotsList = [];

        //Create Cinematic Camera
        this.cineCamera = new PerspectiveCamera(45, aspect, 0.1, 100);
        this.cineCamera.position.copy(CINE_SEQUENCE_POINTS[0].sP)
        this.cineCamera.rotation.copy(MathUtils.vector3DegToRadian(CINE_SEQUENCE_POINTS[0].cR))

        //Create Orbit Camera
        this.orbitCamera = new PerspectiveCamera(45, aspect, 0.1, 100);
        this.orbitCamera.position.copy(ORBIT_CAM_POS);

        //Create OrbitControl
        this.orbitControls = new OrbitControls(this.orbitCamera, renderer.domElement);
        this.orbitControls.target = ORBIT_CAM_TARGET;
        this.orbitControls.enablePan = false;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enableDamping = true;
        this.orbitControls.minPolarAngle = 0.75; //Upper
        this.orbitControls.maxPolarAngle = 1.6; //Lower
        this.orbitControls.dampingFactor = 0.07;
        this.orbitControls.rotateSpeed = 0.07;
        this.orbitControls.minDistance = 16
        this.orbitControls.maxDistance = 32;
        this.orbitControls.autoRotate = true;
        this.orbitControls.autoRotateSpeed = 0.05;

        //Set cine camera as startup camera
        this.mainCamera = this.cineCamera;

        //Iterate through each sequence position array
        for (var i = 0; i < CINE_SEQUENCE_POINTS.length; i++) {

            //Get the tween starting point vector
            var tweenStartPoint = MathUtils.coordR2L(CINE_SEQUENCE_POINTS[i].sP);
            //Get the tween end point vector
            var tweenEndPoint = MathUtils.coordR2L(CINE_SEQUENCE_POINTS[i].eP);
            //Get the duration for this tween
            var tweenDuration = CINE_SEQUENCE_POINTS[i].tD;

            //Create the cinematic tween for current sequence
            var cineTween = new TWEEN.Tween(tweenStartPoint).to(tweenEndPoint, tweenDuration).easing(TWEEN.Easing.Linear.None);

            //On Tween Start
            cineTween.onStart(((id) => {

                //Apply camera rotation for the tween
                return () => this.cineCamera.rotation.copy(MathUtils.vector3DegToRadian(CINE_SEQUENCE_POINTS[id].cR))

            })(i));

            //On Tween Update
            cineTween.onUpdate(pos => { this.cineCamera.position.set(pos.x, pos.y, pos.z); })

            //Add the cinematic tween to shots list
            this.mCineShotsList.push(cineTween);

            //Chain the shot to previous
            if (i > 0)
                this.mCineShotsList[i - 1].chain(this.mCineShotsList[i]);
        }

        //Event will be triggered when the last tween is completed
        this.mCineShotsList[this.mCineShotsList.length - 1].onComplete(() => this.onCineComplete());
    }

    //Event Setter - OnCineComplete
    setOnCineComplete = (cb) => this.onCineComplete = cb;

    //Update
    update() {

        //Update orbit controls if main camera is orbit camera
        if (this.mainCamera === this.orbitCamera)
            this.orbitControls.update();

        //Update Tween Library
        TWEEN.update();
    }

    //Set new aspect and update projection
    setAspect(aspect) {

        //Recalculate aspect for main camera
        this.mainCamera.aspect = aspect;
        //Update the projection matrix
        this.mainCamera.updateProjectionMatrix();
    }

    startCinematic() {

        //Stop ongoing cinematic shot chaining
        this.stopCinematic();

        //Start the first shot in cinematic sequence
        this.mCineShotsList[0].start();
    }

    //Stop cinematic camera movement
    stopCinematic() {
        this.mCineShotsList.forEach(shot => shot.stop());
    }
}