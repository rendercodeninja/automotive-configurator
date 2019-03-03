# WebGL Car Configurator
---
A web demo app for configuring the visual look of a retail car using WebGL rendering. The project was created using ThreeJS WebGL library with model formats in glTF. Click here to view [Demo Video](https://www.youtube.com/watch?v=XnqBqJ7flmw)

<!-- <p align="center"> -->
![alt text](https://raw.githubusercontent.com/EverCG/WebGL-Car-Configurator/master/thumbs/screenshot_0a.jpg)
<!-- </p> -->

### Disclaimer
This project is supplied without any warranty and intended for demo purposes only, to experiment with WebGL (threeJS) and the visual quality that could be achieved with it. The model files were downloaded from [www.tf3dm.com](https://www.tf3dm.com) and optimized using [Blender](https://www.blender.org) for realtime rendering capability.

### Prerequisites
Make sure the following requirements are met.
1. A system with good specs for consistend FPS (Recomends Nvidia 1050 Ti or above)
2. Running WebServer Setup (LAMP/WAMP/MAMP)
3. Latest Chrome/Firefox with JS enabled

### Running the demo
The demo is quite easy to run by following the steps mentioned below

* Make sure WebServer is running.
* Cd into your correspodning WebServer's public folder ('www' by default).
* Clone the repository to public folder `git clone https://github.com/EverCG/WebGL-Car-Configurator.git`
* Open your browser and load from localhost eg: `http://localhost/WebGL-Car-Configurator` (add port number if required)

##### User Controls
* Click and drag using mouse to orbit around the car.
* Use mouse wheel to zoom-in or zoom-out.
* Select any of the options at the bottom of the screen to customize .

### Dependencies
The project depends on the following libraries
1. [Three.js](https://github.com/mrdoob/three.js/)
2. [Tween.js](https://github.com/sole/tween.js/)
3. [GLTF](https://github.com/KhronosGroup/glTF)

### Known Issues
Using exported GLTF materials from blender seems to produce incorrect color results, so recreating the materials in javascript based on material names from blender.
