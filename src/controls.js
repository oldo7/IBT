import { useEffect, useRef, useState } from "react";

import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';

import { cos, diag, factorial, format, index, map, matrix, multiply, ones, pi, range, sin, sqrt } from 'mathjs'

import Video from "./Video";


const Controls = () => {
    //canvas
    let canvasWidth = 2048;
    let canvasHeight = 1536;


    //nacitanie hodnot z trans.csv
    var t1 = -0.4069576531966190291;
    var t2 = -0.3975806851939489572;
    var t3 = 26.37227916275143258;

    //nacitanie hodnot z rot.csv
    var xRotAngle = 0.0023341923;
    var yRotAngle = 0.0067730291;
    var zRotAngle = -0.0046308535;

    //nacitanie hodnot z kalibracnej matice
    var inMatrix = matrix([ 
        [2446,0,1024],
        [0,2446,768],
        [0,0,1]
    ])

    //otocenie na osi Z
    var rotateZaxis = matrix([
        [cos(zRotAngle), -sin(zRotAngle), 0],
        [sin(zRotAngle), cos(zRotAngle), 0],
        [0,0,1]
    ])

    //otocenie na osi X
    var rotateXaxis = matrix([
        [1,0,0],
        [0, cos(xRotAngle), -sin(xRotAngle)],
        [0, sin(xRotAngle), cos(xRotAngle)]
    ])

    //otocenie na osi Y
    var rotateYaxis = matrix([
        [cos(yRotAngle),0,sin(yRotAngle)],
        [0, 1, 0],
        [-sin(yRotAngle), 0, cos(yRotAngle)]
    ])

    //vytvorenie rotacnej matice
    var sMatrix2 = multiply(rotateZaxis, rotateYaxis); //tretia, druha
    var rotmatrix = multiply(sMatrix2, rotateXaxis); // prva

    //obratenie osi Z o 180°
    var rotateZ180 = matrix([
        [ -1, -1.2246467991473532e-16, 0,0 ],
        [ 1.2246467991473532e-16, -1, 0,0 ],
        [ 0, 0, 1,0 ]
    ])

    //posunutie o 1m na osi X a -0.4m na osi Y
    var translateCamera = matrix([
        [1,0,0,1],          // o 1 meter na ose X (smerom do stredu kolajnic)
        [0,1,0,-0.4],       // -0.4m na ose Y (vertikalna os smerom hore)
        [0,0,1,0],
        [0,0,0,1]
    ])

    //zjednodusenie maticoveho nasobenia
    var projMatrix = multiply(inMatrix, rotmatrix);
    var projMatrix2 = multiply(projMatrix, rotateZ180);
    var projMatrix3 = multiply(projMatrix2, translateCamera);

    var noOfpoints = 0;
    

    // instantiate a loader 
    const loader = new PCDLoader(); 
    // load a resource 
    loader.load( '/scans.pcd', 
        function ( points ) {
            const myCanvas = document.getElementById("myCanvas");
            var ctx = myCanvas.getContext("2d");
            ctx.fillStyle = "red";

            for (let i = 0; i < points.geometry.attributes.position.array.length / 3 - 5 ; i++) {           //spracovanie individualnych bodov
                //suradnice bodu po odcitani suradnic kamery
                var WCSMinusCamera = matrix([[points.geometry.attributes.position.array[i*3 + 1] - t1], [points.geometry.attributes.position.array[i*3 + 2] - t2], [points.geometry.attributes.position.array[i*3] - t3], [1]]);
                
                var pixCoords = multiply(projMatrix3, WCSMinusCamera);

                var pixCoordsX = pixCoords._data[0] / pixCoords._data[2];
                var pixCoordsY = pixCoords._data[1] / pixCoords._data[2];

                if(pixCoordsX < 2048 && pixCoordsX > 0 && pixCoordsY < 1536 && pixCoordsY > 0 && pixCoords._data[2] > 1 ){
                    noOfpoints += 1;
                    ctx.fillRect(pixCoordsX, pixCoordsY, 0.5, 0.5);
                }
                
            }
            ctx.fillStyle = "blue";
            ctx.fillRect(0, 0, 5, 5);
            ctx.fillRect(20, 20, 5, 5);
        console.log("amount of shown points: ",noOfpoints);
            

        }, 

        // called when loading is in progresses 
        function ( xhr ) { console.log( "loaded: ", 100*xhr.loaded / xhr.total, "%"); },
        //called when loading has errors 
        function ( error ) { console.log( 'An error happened' );
        } ); 
        
    return (
        <div>
            <div className="videoWrapper">
                <div className="video-container">
                    <video width='1440'
                    height='680' src="https://ik.imagekit.io/ikmedia/example_video.mp4" controls></video>
                    <div className="overlay">
                        <canvas id="myCanvas" width={canvasWidth} height={canvasHeight}></canvas>
                        <Video /> 
                    </div>
                </div>
                
            </div>
            <div className='content'>
            </div>
        </div>
    );
  }
 
export default Controls;