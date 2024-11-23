import { createRoot } from 'react-dom/client'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { BoxGeometry, PointsMaterial} from 'three'
import { OrbitControls, Point, Points } from '@react-three/drei'

import { useEffect } from "react";

import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';

import { cos, diag, factorial, format, index, map, matrix, multiply, ones, pi, range, sin, sqrt } from 'mathjs'

const Box = (props) => {
  var [pcdPoints, setPcdPoints] = useState(null);
    // instantiate a loader 
    const loader = new PCDLoader(); 
    // load a resource 

    loader.load( '/scans.pcd', 
        //spracovanie individualnych bodov
        function ( points ) {
            var pcdPointstemp = [];
            for (let i = 0; i < points.geometry.attributes.position.array.length / 3 - 5 ; i++) {
                var pointX = points.geometry.attributes.position.array[i*3];
                var pointY = points.geometry.attributes.position.array[i*3 + 1];
                var pointZ = points.geometry.attributes.position.array[i*3 + 2];
                
                var WCScoords = matrix([[pointX], [pointY], [pointZ]]);
                if(i%10000 == 0){
                  pcdPointstemp.push({
                    pointNO : i,
                    xcoord: pointX,
                    ycoord: pointY,
                    zcoord: pointZ
                  });
                }
                
                
        }
        console.log(pcdPointstemp);
        setPcdPoints(pcdPointstemp);
        }, 

        // called when loading is in progresses 
        function ( xhr ) { console.log( "loaded: ", 100*xhr.loaded / xhr.total, "%"); },
        //called when loading has errors 
        function ( error ) { console.log( 'An error happened' );
        } );
      return (
    
    <div className='canvas-container'>
    <Canvas camera={{ position: [0,0,-5], fov: 90, near: 0.5, far: 1000}}>
    <axesHelper args={[5]} />
      <mesh position={[-60,2,-2]}>
        <sphereGeometry args={[0.1,0.1,0.1]}></sphereGeometry>
        <meshStandardMaterial color={'orange'}></meshStandardMaterial>
      </mesh>


      <points>
        <pointsMaterial
          size={0.1}
          threshold={0.1}
          color={0xff00ff}
          sizeAttenuation={true}
        />
      </points>


      <OrbitControls />
    </Canvas>
    <div>test</div>
    <div className='sda'>
    { pcdPoints && pcdPoints[0].xcoord }
    </div>
    </div>
    
  )
}

export default Box;