import React, { useEffect, useState, useRef } from 'react';

const useMediaStream = () => {
    const [stream, setStream] = useState(null);
    const isStreamSet = useRef(false);

    useEffect(() => {
        const getMediaStream = async () => {
            if (isStreamSet.current) return;
            isStreamSet.current = true;

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setStream(mediaStream);
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        getMediaStream();

    }, []);

    return { stream };
};

export default useMediaStream;
