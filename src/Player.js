import { useState } from "react";

import * as THREE from 'three'

const Player = () => {
    let canvasWidth = 1028;
    let canvasHeight = 768;

    const [overlayShown, setOverlayShown] = useState(true);

    const handleSwitchOverlay = () => {
        const myCanvas = document.getElementById("myCanvas");

        if(overlayShown){
            myCanvas.setAttribute("style", "display: none");
        }
        else{
            myCanvas.setAttribute("style", "display: block");
        }
        
        

        setOverlayShown(!overlayShown)
    }

    
    
    /*
    window.onload = function() {
    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");

    ctx.fillStyle = "red";


    //vytvorenie nahodnych bodov na ukazku
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    for(let i = 0; i < 2000; i++){
        let x = getRandomInt(1440);
        let y = getRandomInt(680);
        //ctx.fillRect(x,y,2,2)
    }
    // vytvorenie nahodnych bodov na ukazku
    
    };
    */

    return ( 
        <div className="videoWrapper">
            <div className="video-container">
                <video width='1440'
                height='680' src="https://ik.imagekit.io/ikmedia/example_video.mp4" controls></video>
                <div className="overlay">
                    <canvas id="myCanvas" width={canvasWidth} height={canvasHeight}></canvas> 
                </div>
            </div>

            <button onClick={handleSwitchOverlay}>Show overlay</button>
            
        </div>
     );
}
 
export default Player;