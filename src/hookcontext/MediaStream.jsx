import React, { useEffect, useState, useRef } from 'react';

const useMediaStream = () => {
    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3; // Set a limit for retries
    const isStreamSet = useRef(false);

    const getMediaStream = async () => {
        if (isStreamSet.current) return;

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setStream(mediaStream);
            setLoading(false);
            isStreamSet.current = true;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            setError(err);
            setLoading(false);

            if (retryCount < maxRetries) {
                setTimeout(() => {
                    setRetryCount(retryCount + 1);
                    setLoading(true);
                    getMediaStream();
                }, 3000); // Retry after 3 seconds
            } else {
                console.error('Max retries reached. Could not access media devices.');
            }
        }
    };

    useEffect(() => {
        getMediaStream();
    }, [retryCount]);

    return { stream, loading, error };
};

export default useMediaStream;
