import React, {useEffect, useRef} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';

const Test = ({count = 5000}) => {
    const positions = React.useMemo(() => {
        let positions = [];
        for (let i = 0; i < count; i++) {
            positions.push(THREE.MathUtils.randFloatSpread(100)); // x
            positions.push(THREE.MathUtils.randFloatSpread(100)); // y
            positions.push(THREE.MathUtils.randFloatSpread(100)); // z
        }
        return new Float32Array(positions);
    }, [count]);
    return (
        <>
            <Canvas camera={{position: [0, 0, -5]}}>
                <points>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute
                            attachObject={['attributes', 'position']}
                            array={positions}
                            count={positions.length / 3}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial attach="material" size={THREE.MathUtils.randFloat(0.1, 1)} color='white'/>
                </points>
            </Canvas>
        </>
    );
};

export default Test;