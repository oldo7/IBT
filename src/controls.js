import { useEffect, useRef, useState } from "react";

import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';

import { cos, diag, factorial, format, index, map, matrix, multiply, ones, pi, range, sin, sqrt } from 'mathjs'

import Video from "./Video";


const Controls = () => {
    //canvas
    let canvasWidth = 2048;
    let canvasHeight = 1536;


    //vytvorenie rotacnej matice
    //nacitanie rotacnej matice TODO: nacitat zo suboru
    var alpha = -0.1704866598136265121;
    var beta = 0.3070029780899988792;
    var gamma = -0.07677646139145230531;

    //nacitanie hodnot z transformacnej matice
    var t1 = -0.08166290388991392923;
    var t2 = -0.06948978603737683557;
    var t3 = 5.705343872886297518;

    //nacitanie hodnot z kalibracnej matice
    var inMatrix = matrix([ 
        [2446,0,1024],
        [0,2446,768],
        [0,0,1]
    ])

    var exMatrix = matrix([
    [cos(beta) * cos(gamma), sin(alpha) * sin(beta) * cos(gamma) - cos(alpha) * sin(gamma), cos(alpha) * sin(beta) * cos(gamma) + sin(alpha) * sin(gamma)],
    [cos(beta) * sin(gamma), sin(alpha) * sin(beta)* sin(gamma) + cos(alpha) * cos(gamma), cos(alpha) * sin(beta) * sin(gamma) - sin(alpha) * cos(beta)],
    [-sin(beta), sin(alpha) * cos(beta), cos(alpha) * cos(beta)]
    ])

    // test - matica z MATLAB
    var exMatrix2 = matrix([
    [0.9504, 0.0731, 0.3022],
    [-0.1267,0.9787,0.1617],
    [-0.2839,-0.1920,0.9394]
    ])

    // test - matica z MATLAB ZYX
    var exMatrix3 = matrix([
        [0.9394,0.1463,0.3100],
        [-0.1617,0.9865,0.0245],
        [-0.3022,-0.0731,0.9504]
        ])

    //test - matica z matlab ZYX, vymenene poradie uhlov
    var exMatrix4 = matrix([
        [0.9532,-0.0505,0.2980],
        [-0.0007,0.9855,0.1694],
        [-0.3022,-0.1617,0.9394]
        ])

    //test - matica z matlab XYZ, vymenene poradie uhlov
    var exMatrix5 = matrix([
        [0.9394,0.1617,0.3022],
        [-0.1699,0.9855,0.0007],
        [-0.2977,-0.0520,0.9532]
        ])

    //vymena suradnic z xyz na zxy
    var swapCoords = matrix([
        [0,1,0],
        [0,0,1],
        [1,0,0]
    ])

    //2D rotacia pre zrkadlove obratenie obrazka
    var mirrorXYCoordinate = matrix([
        [-1,0,canvasWidth],
        [0,-1,canvasHeight],
        [0,0,1]
    ])

    var xRotAngle = -0.0029755535;
    var yRotAngle = 0.0053582128;
    var zRotAngle = -0.001340002;

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


    //tets

    //zjednodusenie maticoveho nasobenia
    //var sMatrix1 = multiply(inMatrix,rotateXaxis); // posledna
    var sMatrix2 = multiply(rotateZaxis, rotateYaxis); //druha
    var sMatrix3 = multiply(sMatrix2, rotateXaxis); // prva
    var sMatrix4 = multiply(sMatrix3, swapCoords);

    var translateCamera = matrix([
        [1,0,0,1],          // o 1 meter na ose X (smerom do stredu kolajnic)
        [0,1,0,-0.4],       // -0.4m na ose Y (vertikalna os smerom hore)
        [0,0,1,0]
    ])
    //var sMatrix5 = multiply(mirrorXYCoordinate, sMatrix4);

    //console.log(sMatrix4);  //vysledna projekcna matica
    

    var noOfpoints = 0;


    //metoda2 - vytvorenie ext matice, t = -R * cw
    var cw = matrix([[t3],[t2],[t1]]);
    var exMatrixNegative = multiply(exMatrix,-1)
    var t = multiply(exMatrixNegative, cw);
    var exmatrixNew = matrix([
        [0.9532,-0.0505,0.2980, t._data[0][0]],
        [-0.0007,0.9855,0.1694, t._data[1][0]],
        [-0.3022,-0.1617,0.9394,t._data[2][0]]
    ])
    

    // instantiate a loader 
    const loader = new PCDLoader(); 
    // load a resource 

    loader.load( '/scans.pcd', 
        //spracovanie individualnych bodov
        function ( points ) {
            const myCanvas = document.getElementById("myCanvas");
            var ctx = myCanvas.getContext("2d");
            ctx.fillStyle = "red";

            for (let i = 0; i < points.geometry.attributes.position.array.length / 3 - 5 ; i++) {
                var WCSMinusCamera = matrix([[points.geometry.attributes.position.array[i*3] - t3], [points.geometry.attributes.position.array[i*3 + 1] - t2], [points.geometry.attributes.position.array[i*3 + 2] - t1]]);



                var CCScoords = multiply(sMatrix4, WCSMinusCamera);     //vymenenie osi, rotacie
                /*
                if(i % 10000 == 0){
                    console.log(i)
                    console.log(CCScoords)
                    console.log(CCScoords._data[0][0])
                }
                */

                var preTranslation = matrix([   
                    [CCScoords._data[0][0]],
                    [CCScoords._data[1][0]],
                    [CCScoords._data[2][0]],
                    [1]
                ])
                
                
                var translated = multiply(translateCamera, preTranslation)          //posun o 1m a 0.4m
                var unmirrored = multiply(inMatrix, translated);                    //kalibracna matica
                var pixCoords = multiply(mirrorXYCoordinate, unmirrored);           //zrkadlove obratenie
                
                
                //var pixCoords = multiply(sMatrix5, WCSMinusCamera);    //main


                var pixCoordsX = pixCoords._data[0] / pixCoords._data[2]
                var pixCoordsY = pixCoords._data[1] / pixCoords._data[2]


                if(pixCoordsX < 2000 && pixCoordsX > 0 && pixCoordsY < 2000 && pixCoordsY > 0 ){
                    noOfpoints += 1;
                    //console.log("drawing dot on: ", pixCoordsX, pixCoordsY);
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