# Automotive Configurator (ThreeJS)
---
A web demo app for configuring the visual look of a retail car using WebGL rendering. The project was created using ThreeJS WebGL library with model formats in glTF.

#### [Live Demo](https://rendercodeninja.github.io/automotive-configurator)
&nbsp;
![alt text](https://raw.githubusercontent.com/RendercodeNinja/automotive-configurator/main/thumbs/screenshot_0a.jpg)

### Disclaimer
This project is supplied without any warranty and intended for demo purposes only, to experiment with WebGL (threeJS) and the visual quality that could be achieved with it. The model files were downloaded from [www.tf3dm.com](https://www.tf3dm.com) and optimized using [Blender](https://www.blender.org) for realtime rendering capability.

### Prerequisites
Make sure the following requirements are met.
1. A system with good specs for consistent FPS (Recommends Nvidia 1050 Ti or above)
2. NodeJS, npm installed.
3. Latest Chrome/Firefox with JS enabled

### Running the demo
The demo now uses webpack and webpack-dev-server for easy development with hot-loading features and is quiet easy to run by following the steps mentioned below

* Make sure Node and npm are installed.
* Clone the repository to any convenient folder using `git clone https://github.com/RendercodeNinja/automotive-configurator.git`
* Run `npm install` to install all dependency libraries.
* Run `npm run dev` to start the webpack development server.
* The app will be served on `https://localhost:5000`

![alt text](https://raw.githubusercontent.com/RendercodeNinja/automotive-configurator/main/thumbs/screenshot_0b.jpg)

### Building the demo
The demo can also be built for static hosting. All HTML/JS/CSS and asset files will be packed into the `build` folder. Build files should be hosted through a server to avoid CORS Policy blocking by browsers. You can create a build by running the following command

* Any changes to the `sass\style.scss` file should be complied separate using `npm run build-css` before generating builds.
* Afterwards, you can create a build by running `npm run build`

##### User Controls
* Click and drag using mouse to orbit around the car.
* Use mouse wheel to zoom-in or zoom-out.
* Select any of the options at the bottom of the screen to customize .

### Dependencies
The project depends on the following libraries
1. [Three.js](https://github.com/mrdoob/three.js/)
2. [Tween.js](https://github.com/sole/tween.js/)
3. [GLTF](https://github.com/KhronosGroup/glTF)
