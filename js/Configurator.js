/*
 * File :EngineCore.js
 * Description : The main file for interface
 * Date : 28/03/2018
 * License : MIT
 * Author : Sethu Raj
 * URL : https://github.com/EverCG 
 */

//Whether debuging is enabled or not
var IS_DEBUG=false;
//Whether to show fps counter or not
var SHOW_FPS = true;

//The statistics object
var stats;

//The scene object
var mScene;
//The renderer object
var mRenderer;

//The Cinematic camera
var mCineCamera;
//The Orbit camera
var mOrbitCamera;
//The current camera
var mMainCamera;


//The orbit controls object
var mOrbitControls;
//The camera startup position
const mOrbitCamPos =  new THREE.Vector3( 20, 10, 20 );
//The camera lookat target
const mOrbitCamTarget =  new THREE.Vector3( 0, 3, 0 );

//The loader manager
var mManager;

//The texture loader
var  mTextureLoader;

//The Cubemap path
var r = "data/env/cubemap/";
//The cubemap file urls
var urls = [ r + "posx.jpg", r + "negx.jpg",
             r + "posy.jpg", r + "negy.jpg",
             r + "posz.jpg", r + "negz.jpg" ];
//The Cubemap object
 var mCubeMap;

//The Audio Trakc object
var mAudioTrack;

//Array to store the cinematic tweens list
var mCineShotsList=[];

//The current car 3d model
var mC3DGLTF;
//The current body color
var mCBodyColor;

//The json config object
var mConfigJSON;

//Initialize the engine
Initialize();

//Function to initialize
function Initialize()
{
    //Create renderer
    mRenderer = new THREE.WebGLRenderer( { antialias:true } );
    mRenderer.setPixelRatio(window.devicePixelRation);
    mRenderer.setSize(window.innerWidth, window.innerHeight);
    mRenderer.shadowMap.enabled = true;
    mRenderer.shadowMap.type = THREE.PCFSoftShadowMap;      
    mRenderer.setClearColor( 0x000000, 1 );
    mRenderer.sortObjects = false;
    
    //Append the renderer to the document body
    document.body.appendChild(mRenderer.domElement);    
    
    //Create a new scene
    mScene = new THREE.Scene();

    //Create and add a cine cam to the scene
    mCineCamera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    mScene.add(mCineCamera);

    //Create and add an orbit cam to the scene
    mOrbitCamera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    mOrbitCamera.position.copy(mOrbitCamPos);        
     
    //Add event listener to respond to window resize
    window.addEventListener('resize', OnContextResized, true);

    //If FPS enabled
    if(SHOW_FPS)
    {
        //Create a new statistics object
        stats = new Stats();
        //Show the statistics
        stats.showPanel(0);
        //Append the statistics to dom
        document.body.appendChild(stats.dom);
    }   

    //Create a loader manager
    mManager = new THREE.LoadingManager();
    //Callback to be triggered for load progress
    mManager.onProgress = OnLoadProgress;
    //Callback to be triggered when loading completed successfully
    mManager.onLoad =OnLoadCompleted;
    //Callback to be triggered when load errror occured 
    mManager.onError =OnLoadError;  

    //Creat the texture loader  
    mTextureLoader = new THREE.TextureLoader(mManager); 
    
    //Set the cinematic camera as main camera
    mMainCamera = mCineCamera;

    //Load the audtio track
    mAudioTrack = new Audio('data/audio_track.mp3');

    //Setup the environment
    SetupEnvironment(); 

	//Load the meta config data	
    $.getJSON("data/aventador/meta.json", function(json) 
    {
    	//Get reference of the json object
        mConfigJSON = json;

		//Load the aventador model
    	LoadAventador(mConfigJSON);    	

		//Create the cinematics
    	AddCinemeticSequence();       	

    });    

	//Recalculate context
	OnContextResized(); 
    
}

//Function to setup the environment
function SetupEnvironment()
{
    //Create and add an ambient light
    ambientLight = new THREE.AmbientLight( 0xffffff, 0.1 );
    mScene.add( ambientLight );

    //Light Size
    var size=6;
    //Light Intensity
    var intensity = 14;
    //Light color
    var color =0xffffff;    

    //The light width and height
    var lWidth = 12, lHeight = 6;

    //Add a front light
    var mFrontLight = CreateAreaLight(mScene, color, intensity, new THREE.Vector2(lWidth,lHeight), IS_DEBUG ? true:false );     
    mFrontLight.rotation.copy(Vector3DegToRadian({x:90, y:45, z:-90})); 
    mFrontLight.position.copy(new THREE.Vector3( -26, 16, 0 ));

    //Add a back light
    var mBackLight = CreateAreaLight(mScene, color, intensity, new THREE.Vector2(lWidth,lHeight), IS_DEBUG ? true:false);   
    mBackLight.rotation.copy(Vector3DegToRadian({x:90, y:-45, z:90}));
    mBackLight.position.copy(new THREE.Vector3( 26, 16, 0 ));

    //Add a Right Light
    var mRightLight = CreateAreaLight(mScene, color, intensity, new THREE.Vector2(lWidth,lHeight), IS_DEBUG ? true:false);
    mRightLight.rotation.copy(Vector3DegToRadian({x:135, y:0, z:180}));
    mRightLight.position.copy(new THREE.Vector3(0,16,18));
    
    //Add a left Light
    var mLeftLight = CreateAreaLight(mScene, color, intensity, new THREE.Vector2(lWidth,lHeight), IS_DEBUG ? true:false);
    mLeftLight.rotation.copy(Vector3DegToRadian({x:45, y:0, z:0}));
    mLeftLight.position.copy(new THREE.Vector3(0,16,-18));

    //Load the environmet cubemap from file
    mCubeMap = new THREE.CubeTextureLoader(mManager).load( urls );
    mCubeMap.format = THREE.RGBFormat;
    mCubeMap.mapping = THREE.CubeReflectionMapping;

    //Load the floor plane textures and set wrappings
    var DTX_Floor = mTextureLoader.load("data/env/asphalt_albedo.png");
    var NTX_Floor = mTextureLoader.load("data/env/asphalt_normal.png");    
    var RTX_Floor = mTextureLoader.load("data/env/asphalt_rouphness.png"); 
    DTX_Floor.wrapS = DTX_Floor.wrapT = THREE.RepeatWrapping; DTX_Floor.repeat.set( 64, 64 );
    NTX_Floor.wrapS = NTX_Floor.wrapT = THREE.RepeatWrapping; NTX_Floor.repeat.set( 64, 64 );
    RTX_Floor.wrapS = RTX_Floor.wrapT = THREE.RepeatWrapping; RTX_Floor.repeat.set( 64, 64 );   
    //Create the  floor material
    var Mt_Floor = new THREE.MeshStandardMaterial({roughness:1, metalness:0, map:DTX_Floor, normalMap:NTX_Floor, roughnessMap:RTX_Floor});
    //Create the floor plane object and add to the scene
    var mFloorPlane = new THREE.Mesh( new THREE.PlaneGeometry( 512, 512, 1,1 ), Mt_Floor );
    mFloorPlane.rotation.x = -Math.PI/2;
    mScene.add( mFloorPlane );

	var DTX_Shadow = mTextureLoader.load("data/env/fake_shadow.png");
    var mShadowPlane = new THREE.Mesh( new THREE.PlaneGeometry( 36, 18, 1,1 ), new THREE.MeshBasicMaterial({color:0xffffff, map:DTX_Shadow, transparent:true}) );
    mShadowPlane.rotation.x = -Math.PI/2;
    mShadowPlane.position.y=0.05;
    mScene.add( mShadowPlane );
}

//Function to skip the intro
function SkipIntro()
{
    //Start fading the audio
    $(mAudioTrack).animate({volume:0},900,function()
    {
        //Remove te audio track         
        $(mAudioTrack).remove();
    });

    //Start fading in the screen
    $('.screen-fader')  
    .fadeIn(900, function()
    {
        //Loop through each cinematic tween and stop it
        for(var i=0;i<mCineShotsList.length; i++)       
            mCineShotsList[i].stop();       

        //Remove the welcome screen
        $('.welcome-screen').remove();

        //Set the main camera to orbit camera
        SetOrbitCamera();

        //Load the configuration
        LoadConfigurator(mConfigJSON);

        //Fade out the screen
        $('.screen-fader').fadeOut(900);
    });
}

//Function to load the entities
function LoadAventador(config)
{
	var stpIndex = 3;//getRandomInt(0,config.body_colors.colors.length-1);

	//Choose a random body color
	mCBodyColor = config.body_colors.colors[stpIndex].value;	

	//Get the startup colors for configurables
	var dfCol_Body 				= webColorToHex(mCBodyColor);
	var dfCol_Mirror			= webColorToHex(config.mirror_colors.colors[0].value);
	var dfCol_Alloys			= webColorToHex(config.wheel_colors.colors[0].value);
	var dfCol_Caliper			= webColorToHex(config.caliper_colors.colors[0].value);	

    var AventadorAtlas_Albedo   = LoadTextureCorrected(mTextureLoader, "data/aventador/AventadorAtlas_Albedo.png");
    var AventadorAtlas_Normal	= LoadTextureCorrected(mTextureLoader, "data/aventador/AventadorAtlas_Normal.png");
    var LR_Brake_Albedo         = LoadTextureCorrected(mTextureLoader, "data/aventador/LR_Brake_Albedo.png");     
    var LR_Turn_Albedo          = LoadTextureCorrected(mTextureLoader, "data/aventador/LR_Turn_Albedo.png");      
    var LR_Reverse_Albedo       = LoadTextureCorrected(mTextureLoader, "data/aventador/LR_Reverse_Albedo.png");   
    var LR_Generic_Normal       = LoadTextureCorrected(mTextureLoader, "data/aventador/LR_Generic_Normal.png");  
	
    //Create the necessary materials
    var Mt_Abs_Black_Gloss      = new THREE.MeshStandardMaterial( {color: 0x000000, roughness:0.0, metalness:0.0, envMap:mCubeMap} );
    var Mt_ABS_Black_Mat        = new THREE.MeshStandardMaterial( {color: 0x000000, roughness:0.5, metalness:0.5, envMap:mCubeMap} );
    var Mt_Abs_White_Mat        = new THREE.MeshStandardMaterial( {color: 0xffffff, roughness:0.0, metalness:0.0, envMap:mCubeMap} );    
    var Mt_AlloyWheels			= new THREE.MeshStandardMaterial( {name:  'Mt_AlloyWheels', color: dfCol_Alloys, roughness:0.1, metalness:0.5, envMap:mCubeMap });

    var Mt_AventadorAtlas       = new THREE.MeshStandardMaterial( {color: 0xffffff, roughness:0.5, metalness:0.5, envMap:mCubeMap, map:AventadorAtlas_Albedo, transparent:true} ); 

    var Mt_Body                 = new THREE.MeshStandardMaterial( {name: 'Mt_Body', color: dfCol_Body, roughness:0.0, metalness:0.0, envMap:mCubeMap} );    
    var Mt_BrakeCaliper        	= new THREE.MeshStandardMaterial( {name: 'Mt_BrakeCaliper', color: dfCol_Caliper, roughness:0.5, metalness:0.5, envMap:mCubeMap} );
    var Mt_Chrome               = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.0, metalness:1.0, envMap:mCubeMap} );
    var Mt_Glass_Lens           = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.0, metalness:0.25, envMap:mCubeMap} );

    var Mt_Glass_Translucent    = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.0, metalness:1.0, envMap:mCubeMap, transparent:true, opacity:0.25} );

    var Mt_Interior_Black		= new THREE.MeshStandardMaterial( {color: 0x525252, roughness:0.5, metalness:0.5, envMap:mCubeMap} );
    var Mt_Metal_Black_Glossy   = new THREE.MeshStandardMaterial( {color: 0x000000, roughness:0.1, metalness:0.5, envMap:mCubeMap} );
    var Mt_Metal_Brushed        = new THREE.MeshStandardMaterial( {color: 0x555555, roughness:0.0, metalness:1.0, envMap:mCubeMap} );
    var Mt_Mirror               = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.0, metalness:1.0, envMap:mCubeMap} );   
    var Mt_MirrorCover			= new THREE.MeshStandardMaterial( {name:  'Mt_MirrorCover', color: dfCol_Body, roughness:0.0, metalness:0.0, envMap:mCubeMap });
    var Mt_Reflector_BL         = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:1.0, metalness:0.0, envMap:mCubeMap, map:LR_Brake_Albedo, normalMap:LR_Generic_Normal} );
    var Mt_Reflector_RL         = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:1.0, metalness:0.0, envMap:mCubeMap, map:LR_Reverse_Albedo, normalMap:LR_Generic_Normal} );
    var Mt_Reflector_TL         = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:1.0, metalness:0.0, envMap:mCubeMap, map:LR_Turn_Albedo, normalMap:LR_Generic_Normal} );  
    var Mt_TurnLights           = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.5, metalness:0.5, envMap:mCubeMap} );   
    var Mt_Tyres                = new THREE.MeshStandardMaterial( {color: 0xFFFFFF, roughness:0.5, metalness:0.5, envMap:mCubeMap, map:AventadorAtlas_Albedo, normalMap:AventadorAtlas_Normal} );
    var Mt_WindScreens          = new THREE.MeshStandardMaterial( {color: 0x000000, roughness:0.0, metalness:0.0, envMap:mCubeMap, transparent:true, opacity:0.25} );
    
    //The gltf object loader
    var gltfLoader = new THREE.GLTFLoader(mManager);

    // Load a glTF resource
    gltfLoader.load(
    // resource URL
    'data/aventador/aventador.gltf',
    // called when the resource is loaded
    function ( gltf ) 
    {
        //Take areference of the current gltf model
        mC3DGLTF = gltf;

        mC3DGLTF.scene.traverse(function(obj)
        {
            if(obj instanceof THREE.Mesh)
            {   
            	
            	//Assign new materials
                if(obj.material.name=="Mt_Abs_Black_Gloss")
                    obj.material =Mt_Abs_Black_Gloss ;
                if(obj.material.name=="Mt_ABS_Black_Mat")
                    obj.material = Mt_ABS_Black_Mat;
                if(obj.material.name=="Mt_Abs_White_Mat")
                    obj.material = Mt_Abs_White_Mat;
                if(obj.material.name=="Mt_AlloyWheels")
                    obj.material = Mt_AlloyWheels;
                if(obj.material.name=="Mt_AventadorAtlas")
                    obj.material = Mt_AventadorAtlas;
                if(obj.material.name=="Mt_Body")
                    obj.material = Mt_Body;
                if(obj.material.name=="Mt_BrakeCaliper")
                    obj.material = Mt_BrakeCaliper;
                if(obj.material.name=="Mt_Chrome")
                    obj.material = Mt_Chrome;
                if(obj.material.name=="Mt_Glass_Lens")
                    obj.material = Mt_Glass_Lens;
                if(obj.material.name=="Mt_Glass_Translucent")
                    obj.material =Mt_Glass_Translucent ;
                if(obj.material.name=="Mt_Interior_Black")
                    obj.material =Mt_Interior_Black ;
                if(obj.material.name=="Mt_Metal_Black_Glossy")
                    obj.material = Mt_Metal_Black_Glossy;
                if(obj.material.name=="Mt_Metal_Brushed")
                    obj.material =Mt_Metal_Brushed ;
                if(obj.material.name=="Mt_Mirror")
                    obj.material = Mt_Mirror;
                if(obj.material.name=="Mt_MirrorCover")
                    obj.material = Mt_MirrorCover;
                if(obj.material.name=="Mt_Reflector_BL")
                    obj.material = Mt_Reflector_BL;
                if(obj.material.name=="Mt_Reflector_RL")
                    obj.material = Mt_Reflector_RL;
                if(obj.material.name=="Mt_Reflector_TL")
                    obj.material = Mt_Reflector_TL;
                if(obj.material.name=="Mt_TurnLights")
                    obj.material = Mt_TurnLights;
                if(obj.material.name=="Mt_Tyres")
                    obj.material =Mt_Tyres ;
                if(obj.material.name=="Mt_WindScreens")
                    obj.material = Mt_WindScreens;


            }					

			
			//If this is a rim object and not the first type
            if(obj.name.includes('Obj_Rim') && !obj.name.includes(config.wheel_designs.designs[0].value))            	
            	obj.visible=false;
        });



        //Add the gltf object to the scene
        mScene.add( mC3DGLTF.scene );
    }); 
}

//Function will be called with load progress
function OnLoadProgress(_item, _loaded, _loaded)
{
    //Show loading progress
    $('.preloader .desc').text("("+_loaded+"/"+_loaded+")");
}

//Function will be called when everything loaded succesfully
function OnLoadCompleted()
{
    //Log here
    console.log('All data loaded successfully');
    
    //Fade out the preloader and remove it
    $('.preloader')
    .fadeOut(900,function()
    { 
        //Remove the prelaoder
        $(this).remove();       

        //Display the intro skip button after a delay
        $('.welcome-screen .ws-wrapper button').fadeIn(900);
        // $('.welcome-screen .ws-wrapper button').delay(9000).fadeIn(900);
    });    

    // Start the cinematic
    mCineShotsList[0].start();
    //Start the audio track
    mAudioTrack.play();
}


//Function will be called when a load error occured
function OnLoadError(item)
{
    //Display load error
    $('.preloader .title').text("ERROR LOADING DATA");
    //Display the load error file
    $('.preloader .desc').text(item);
}

//Function to add the cinematic sequence
function AddCinemeticSequence()
{   
    //The cinematic sequence
    var mSequence = 
    [
        {
            sP:{x:-28, y:-26, z:3.5},
            eP:{x:-25, y:-23, z:3.5},
            cR:{x:0.0, y:-45, z:5.0},
            tD:9500
        },
        {
            sP:{x:-18, y:0,   z:2.5},
            eP:{x:-18, y:0,   z:5.5},
            cR:{x:0.0, y:-90, z:0.0},
            tD:5000
        },
        {
            sP:{x:-13.50, y:-3.75,  z:3.75},
            eP:{x:-12.00, y:-5.50,  z:4.50},
            cR:{x:-41.79, y:-42.36, z:-19.55},
            tD:7000
        },
        {
            sP:{x:-10.50, y:-8.0,   z:1.50},
            eP:{x:-14.00, y:-12.0,  z:1.00},
            cR:{x:10.12,  y:-43.88, z:-7.06},
            tD:7000
        },
        {
            sP:{x:-13,    y:-14, z:14},
            eP:{x:11,     y:-14, z:14},
            cR:{x:-38.28, y:0.0, z:0.0},
            tD:12000
        },
        {
            sP:{x:12.85, y:-1.0,  z:4.35},
            eP:{x:12.85, y:0.70,  z:4.35},
            cR:{x:47.34, y:50.53, z:-33.90},
            tD:7000
        },
        {
            sP:{x:13, y:-4.5,  z:2.5},
            eP:{x:13, y:-4.5,  z:5.0},
            cR:{x:0,  y:58, z:5.35},
            tD:7000
        },
        {
            sP:{x:-3.3, y:-6.5,  z:5.0},
            eP:{x:1.2, y:-6.5,   z:5.35},
            cR:{x:-30.65, y:-55.53, z:-1.88},
            tD:5000
        },
        {
            sP:{x:-13.85, y:-0.35,  z:3.15},
            eP:{x:-14.50, y:-1.1,   z:3.75},
            cR:{x:-35.54, y:-35.16, z:-15.17},
            tD:8000
        }
    ];

    for(var i=0;i<mSequence.length;i++)
    {
        //Get the tween starting point vector
        var tweenStartPoint = CoordR2L(mSequence[i].sP);
        //Get the tween end point vector
        var tweenEndPoint = CoordR2L(mSequence[i].eP);
        //Get the duration for this tween
        var tweenDuration = mSequence[i].tD;
        //Get the distance for this tween
        var tweenDistance = distanceVector(tweenEndPoint, tweenStartPoint);

        var cineShot = new TWEEN.Tween(tweenStartPoint).to(tweenEndPoint, tweenDuration).easing(TWEEN.Easing.Linear.None)
        .onStart( (function(id, ctx)
        {
            return function() 
            { 
                //Set the new camera orientation
                mCineCamera.rotation.copy(Vector3DegToRadian(mSequence[id].cR)); 

            };

        })(i,this))             
        .onUpdate((function(endPoint, totalDistance)
        {
            return function()
            {
                //Tween the postion
                mCineCamera.position.set(this.x,this.y,this.z);
            };

        })(tweenEndPoint, tweenDistance));

        //Add the cine shot to shots list
        mCineShotsList.push(cineShot);

        //Chain the shot to previous
        if(i>0)
            mCineShotsList[i-1].chain(mCineShotsList[i]);
    }

    //Event will be triggered when the last tween is completed
    mCineShotsList[mCineShotsList.length-1].onComplete(function()
    {
        //Skip the intro to orbit camera
        SkipIntro();
    });

    //If debug mode enabled, add camera helper for cine cam
    if(IS_DEBUG)
        mScene.add( new THREE.CameraHelper( mCineCamera ) );        
}


//Start the update function
Update();

function Update()
{
	//If FPS enabled, start profiling
    if(SHOW_FPS)
        stats.begin();

    //Update the tween animations
    TWEEN.update(); 

    //Update the orbit controls
    if(mMainCamera == mOrbitCamera)
       mOrbitControls.update();   

    //Render the scene through camera
    mRenderer.render(mScene, mMainCamera);

	//Enable profiling if fps enabled
    if(SHOW_FPS)
        stats.end();

    //Request updation of next frame
    requestAnimationFrame(Update);
}

//Function will be called whenver the context is resized
function OnContextResized()
{
    //Recalculate the aspect ratio
    mMainCamera.aspect = window.innerWidth/window.innerHeight;
    //Set new renderer size
    mRenderer.setSize(window.innerWidth, window.innerHeight);
    //Update the projection matrix
    mMainCamera.updateProjectionMatrix();
}

/*------------------------------------------------------------
                CONFIGURATION PALETTE
 -----------------------------------------------------------*/

//Function to load the configurration palette
function LoadConfigurator(mConfigJSON)
{
    //The config palette element
    var config_palette = $([
    '<div class="configurator-palette">',
        '<div class="options-palette">',
            '<nav class="nav-config">',
                '<ul>',
                    '<li>',
                        '<a class="nav-config-item" data-id="body_colors">',
                            '<span>BODY COLOR</span>',
                        '</a>',
                    '</li>',
                    '<li>',
                        '<a class="nav-config-item" data-id="mirror_colors">',
                            '<span>SIDE MIRRORS</span>',
                        '</a>',
                    '</li>',
                    '<li>',
                        '<a class="nav-config-item" data-id="wheel_designs">',
                            '<span>WHEELS</span>',
                        '</a>',
                    '</li>',
                    '<li>',
                        '<a class="nav-config-item" data-id="wheel_colors">',
                            '<span>WHEEL COLOR</span>',
                        '</a>',
                    '</li>',
                    '<li >',
                        '<a class="nav-config-item" data-id="caliper_colors">',
                            '<span>CALIPERS</span>',
                        '</a>',
                    '</li>',
                '</ul>',
            '</nav>',
            '<div class="palette-container">',
                '<div id="body_colors" class="palette-content">',  
                    '<ul>',
                    '</ul>',
                '</div>',

                '<div id="mirror_colors" class="palette-content">',
                    '<ul>',                
                    '</ul>',
                '</div>',

                '<div id="wheel_designs" class="palette-content">',
                    '<ul>',
                    '</ul>',
                '</div>',

                '<div id="wheel_colors" class="palette-content">',
                    '<ul>',
                    '</ul>',
                '</div>',

                '<div id="caliper_colors" class="palette-content">',
                    '<ul>',
                    '</ul> ',
                '</div>',
            '</div>',
        '</div>',

     '</div>'].join(''));

    //Append the cofigurator palette to body
    $('body').append(config_palette);   

    //Upon clicking the config tab
    $('.nav-config-item',config_palette).click(function()
    {
        //Get the clicked tab id
        var configID = $(this).data('id');  

        //If the palette is already active
        if($(this).hasClass("active"))
        {
            //Empty the container
            $('#'+configID+" ul",config_palette).empty();
            $(this).removeClass('active');
            //Do not execute further
            return;
        }

        //Deactivate all config tab links
        $('.nav-config-item',config_palette).removeClass('active');
        //Hide all config tab contents
        $('.palette-content',config_palette).hide();                       
        
        //Add object/texture swatch if wheel design
        if(configID=='wheel_designs')     
        {
            AddTextureSwatches($('#'+configID+" ul",config_palette),mConfigJSON[configID],function(targetName)
            {
                //Set the corresponding entity object visible
                SetEntityVisible(mC3DGLTF.scene,targetName);

            });
        }
        //Add the color swatches
        else                
        { 
            AddColorSwatches($('#'+configID+" ul",config_palette), mConfigJSON[configID], (configID =='mirror_colors') ? mCBodyColor: null, function(color, targetMat)
            {                   
                //Set the corresponding entity color
                SetEntityColor(color, targetMat);
                //If changed body color, change mirror color cover also
                if(targetMat=='Mt_Body')
                    SetEntityColor(color,'Mt_MirrorCover');

            });
        }
                 
        //Set the current clicked tab active
        $('.nav-config-item[data-id="'+configID+'"]',config_palette).addClass("active");
        //Show the clicked palette conent
        $('#'+configID, config_palette).show();     
    });    
    
}

//Function to add color swatches
function AddColorSwatches(container, configEntity, def, onClickCallback)
{		
	//Empty the container
	$(container).empty();

	//Get the color array
	var colorList = configEntity.colors.slice(0);;

	//If default color available
	if(def)
		colorList.unshift({"name":"Current","value":def});

	//Loop through each colors for config entity
	for(var i=0;i<colorList.length;i++)
	{
		var colorSwatch = $('<li><button class="color-swatch"><span>'+colorList[i].name+'</span></button></li>');            
		//Set the color swatch
	 	$('button', colorSwatch).css({"background":colorList[i].value});	
		//Trigger the callback with data on clicking swatch button
	 	$('button',colorSwatch).click(function(color, target) { return function(){onClickCallback(color,target)};}(colorList[i].value,configEntity.target));
	 	//Add the color swatch to corresponding container
	 	$(container).append(colorSwatch);
	}	
}

//Function to add texture swatches
function AddTextureSwatches(container, configEntity, onClickCallback)
{	
	//Empty the container
	$(container).empty();

	//Loop through each entry in config entity
	for(var i=0;i<configEntity.designs.length;i++)
	{
		var url="data/aventador/"+configEntity.designs[i].thumb;
		//Create the texture swatch object
		var textureSwatch = $('<li><button class="texture-swatch"><span>'+configEntity.designs[i].name+'</span></button></li>');
		$('button',textureSwatch).css({'background-image':'url('+url+')'});
		//Trigger the callback with data on clicking swatch button
		$('button', textureSwatch).click(function(targetName){return function(){onClickCallback(targetName);};}(configEntity.designs[i].value));
		//Add the texture swatch to corresponding container
		$(container.append(textureSwatch));
	}
}

//Function to set the color of an entityt
function SetEntityColor(color, targetMat)
{		
	mC3DGLTF.scene.traverse(function(obj)
    {
        if(obj instanceof THREE.Mesh)
        {
            if(obj.material.name == targetMat)
            {                
                //Set the material color
                obj.material.color.setHex(webColorToHex(color));

                //Cache if current body color changed
                if(targetMat == 'Mt_Body')
                	mCBodyColor = color;

                //Return after changing one material
                return;
            }
        }
    });
}

//Function to set the entity visibility
function SetEntityVisible(nodeObject, targetName)
{
	//Traverse through the object
	nodeObject.traverse(function(object)
	{
		//If this is a rim object
		if(object.name.includes('Obj_Rim'))
		{
			//Show if name matches target, else hide it
			if(object.name.includes(targetName))
				object.visible=true;
			else
				object.visible=false;
		}
		
	});
}


//Function to set orbit camera as new camera
function SetOrbitCamera()
{
    //Create new orbit controls
    mOrbitControls = new THREE.OrbitControls(mOrbitCamera,mRenderer.domElement);
    mOrbitControls.target = mOrbitCamTarget;
    mOrbitControls.enablePan = false;
    mOrbitControls.enableZoom = true; 
    mOrbitControls.enableDamping = true;
    mOrbitControls.minPolarAngle = 0.75; //Uper
    mOrbitControls.maxPolarAngle = 1.6; //Lower
    mOrbitControls.dampingFactor = 0.07;
    mOrbitControls.rotateSpeed = 0.07;
    mOrbitControls.minDistance = 16
    mOrbitControls.maxDistance = 32;
    mOrbitControls.autoRotate = true;
    mOrbitControls.autoRotateSpeed = 0.05;

    //Set orbit camera as main camera
    mMainCamera = mOrbitCamera;

    //Recalculate context
    OnContextResized();
}

/*------------------------------------------------------------
                        HELPER FUNCTIONS
 -----------------------------------------------------------*/
//Function to create an area light
function CreateAreaLight(scene, color, intensity, size, visible)
{
    //Create an area light with parameters
    var rectLight = new THREE.RectAreaLight( color, intensity, size.x, size.y );    
    //Add the ligh to the scene
    scene.add( rectLight );

    //Add visibility and back mesh if required
    if(visible)
    {
        var rectLightMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial() );
        rectLightMesh.scale.x = rectLight.width;
        rectLightMesh.scale.y = rectLight.height;
        rectLight.add( rectLightMesh );

        var rectLightMeshBack = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
        rectLightMeshBack.rotation.y = Math.PI;
        rectLightMesh.add( rectLightMeshBack );
    }

    //Return the created light
    return rectLight;
}

 //Function to convert vector3 from degree to radian
 function Vector3DegToRadian(_vector3)
{
    //The per dgree converter
    var degree = Math.PI/180;
    //Return the new vector3 in radian
    return  new THREE.Euler(_vector3.x*degree, _vector3.y * degree, _vector3.z * degree, 'XYZ');
}

//Function to convert points from right hand to left hand coordinate system
function CoordR2L(_point)
{
    //Swap Y and Z with Z=-Y
    return { x:_point.x, y:_point.z, z:-_point.y };
}

//Function to get the distance between two Vector3
function distanceVector( V3A, V3Bs )
{
    //Get the vector3 values delta
    var deltaX = V3A.x - V3Bs.x;
    var deltaY = V3A.y - V3Bs.y;
    var deltaZ = V3A.z - V3Bs.z;
    
    //Return the calculated distance
    return Math.sqrt( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ );
}

//Function to load texture corrected
function LoadTextureCorrected(_loader, _path)
{
    //Load the texture
    var texture = _loader.load(_path);
    //Set repeat wrapping
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
    //Flip texture vertically
    texture.repeat.y    = - 1;
    //Return the corrected texture
    return texture;
}

//Function to convert webcolor to hex color
function webColorToHex(color)
{
	return parseInt(color.replace("#","0x"));
}

//Function to get a random int (min,max inclusive)
function getRandomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}