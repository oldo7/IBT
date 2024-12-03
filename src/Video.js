import { useState } from "react";

const Video = () => {
    const [overlayShown, setOverlayShown] = useState(true);

    const handleSwitchOverlay = () => {
        const topImage = document.getElementById("templateImage");
        /*
        if(overlayShown){
            topImage.setAttribute("left", "3000px");
        }
        else{
            topImage.setAttribute("left", "0px");
        }
        */
        

        setOverlayShown(!overlayShown)
    }

    return ( 
        <div>
        {overlayShown && <img id="templateImage" src="new100.png"></img>}
        <button onClick={handleSwitchOverlay}>Show overlay</button>
        </div>
     );
}
 
export default Video;