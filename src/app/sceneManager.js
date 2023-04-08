import { Mesh, MeshBasicMaterial } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ACTIVE_PATH, STAGE_PATH } from './config';
import { ColorUtils } from './utilities';

export const SceneManager = (() => {

    //glTF Loader
    let glTFLoader = null;
    //Reference to the model object
    let mActiveModel = null;

    //Method - Initialize SceneManager
    const init = (loaderManager) => {
        //Create a GLTF Loader
        glTFLoader = new GLTFLoader(loaderManager);
    }

    //Method - Load Stage Model
    const loadStage = (scene) => {

        //Throw error if SceneManager not initialized
        if (!glTFLoader)
            throw new Error('SceneManager init should be called.');

        //Use glTF loader to load the Stage model
        glTFLoader.setPath(STAGE_PATH).load('model.glb', model => {

            //Add environment model to scene
            scene.add(model.scene);
        });
    }

    //Method - Load Active Model with Meta
    const loadActiveModel = (scene, meta) => {

        //Throw error if SceneManager not initialized
        if (!glTFLoader)
            throw new Error('SceneManager init should be called.');

        //Get the defaults for configurable
        const defBody = meta.body_colors.default;
        const defMirror = meta.mirror_colors.default;
        const defAlloys = meta.wheel_colors.default;
        const defCaliper = meta.caliper_colors.default;

        //Get the startup colors for configurables
        const dfCol_Body = ColorUtils.webColorToHex(meta.body_colors.colors[defBody].value);
        const dfCol_Mirror = ColorUtils.webColorToHex(meta.mirror_colors.colors[defMirror].value);
        const dfCol_Alloys = ColorUtils.webColorToHex(meta.wheel_colors.colors[defAlloys].value);
        const dfCol_Caliper = ColorUtils.webColorToHex(meta.caliper_colors.colors[defCaliper].value);

        //Use glTF loader to load the active model
        glTFLoader.setPath(ACTIVE_PATH).load('model.glb', model => {

            //Cache active model for this instance
            mActiveModel = model.scene;

            //Iterate through the Aventador model
            mActiveModel.traverse(obj => {

                //If object is a mesh with material
                if (obj instanceof Mesh) {

                    //Set Color - Body
                    if (obj.material.name === 'Mt_Body')
                        obj.material.color = dfCol_Body;
                    //Set Color - Mirror Cover
                    if (obj.material.name === 'Mt_MirrorCover')
                        obj.material.color = dfCol_Mirror;
                    //Set Color - Alloys
                    if (obj.material.name === 'Mt_AlloyWheels')
                        obj.material.color = dfCol_Alloys;
                    //Set Color -Calipers
                    if (obj.material.name === 'Mt_BrakeCaliper')
                        obj.material.color = dfCol_Caliper;
                    //Override Shadow Plane - Use MeshBasicMaterial
                    if (obj.material.name === 'Mt_Shadow_Plane')
                        obj.material = new MeshBasicMaterial({ color: 0xffffff, map: obj.material.map, transparent: true })
                }

                //If this is a rim object and not the first type
                if (obj.name.includes('Obj_Rim') && !obj.name.includes(meta.wheel_designs.designs[0].value))
                    obj.visible = false;
            })

            //Add Aventador model to scene
            scene.add(mActiveModel)
        })
    }

    //Method - Set entity color by material name
    const setEntityColor = (targetMat, webColor) => {

        //Iterate through the Aventador model
        mActiveModel.traverse(obj => {

            //If object is a mesh with material
            if (obj instanceof Mesh) {

                //If material name matched
                if (obj.material.name === targetMat) {

                    //Set material color from converted web color
                    obj.material.color = ColorUtils.webColorToHex(webColor);
                }
            }
        });
    }

    //Method - Set entity visibility by object name
    const setEntityVisible = (targetName) => {

        //Iterate through the Aventador model
        mActiveModel.traverse(obj => {

            //If this is a rim object
            if (obj.name.includes('Obj_Rim')) {

                //Show if name matches target, else hide it
                obj.visible = obj.name.includes(targetName)
            }

        });
    }



    //Return Public Methods/Properties
    return { init, loadStage, loadActiveModel, setEntityColor, setEntityVisible }

})();


