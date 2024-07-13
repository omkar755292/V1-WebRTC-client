import React, { useRef, useState, useEffect } from 'react';

const Room = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [roomNumber, setRoomNumber] = useState('123456'); // Example room number
  const [userName, setUserName] = useState('John Doe'); // Example user name
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleVideoPause = () => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = !localVideoRef.current.muted;
      setVideoPaused(localVideoRef.current.muted);
      console.log(`Video ${localVideoRef.current.muted ? 'muted' : 'unmuted'}`);
    }
  };

  const handleVoiceMute = () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setVoiceMuted(!track.enabled);
      });
      console.log(`Voice ${voiceMuted ? 'muted' : 'unmuted'}`);
    }
  };

  const handleStartRecording = () => {
    if (localVideoRef.current && !recording) {
      try {
        mediaRecorderRef.current = new MediaRecorder(localVideoRef.current.srcObject);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.start();
        setRecording(true);
        console.log('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      console.log('Recording stopped');
    }
  };

  const handleDataAvailable = (event) => {
    chunksRef.current.push(event.data);
  };

  const handleScreenShare = () => {
    if (!screenSharing) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            setScreenSharing(true);
          }
        })
        .catch((error) => {
          console.error('Error accessing screen sharing:', error);
        });
    } else {
      // Stop screen sharing
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
      setScreenSharing(false);
    }
  };

  const handleEndCall = () => {
    // Logic to end the call
    console.log('Call ended');
  };

  useEffect(() => {
    // Example logic to access local camera and microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, []);

  // Simulate remote user connection after 3 seconds (for demonstration)
  useEffect(() => {
    const timer = setTimeout(() => {
      setRemoteUserConnected(true);
    }, 3000); // Replace with actual logic to detect remote user connection

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="flex justify-center mb-4">
        {remoteUserConnected ? (
          <>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600"
              style={{ width: '50%', minWidth: '320px', height: 'auto' }}
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              className="rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600"
              style={{ width: '50%', minWidth: '320px', height: 'auto' }}
            />
          </>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600"
            style={{ width: '100%', maxWidth: '640px', height: 'auto' }}
          />
        )}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleVideoPause}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4 ${videoPaused ? 'bg-gray-300' : ''}`}
        >
          {videoPaused ? (
            <span className="material-icons">videocam_off</span>
          ) : (
            <span className="material-icons">videocam</span>
          )}
        </button>
        <button
          onClick={handleVoiceMute}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4 ${voiceMuted ? 'bg-gray-300' : ''}`}
        >
          {voiceMuted ? (
            <span className="material-icons">mic_off</span>
          ) : (
            <span className="material-icons">mic</span>
          )}
        </button>
        {!screenSharing ? (
          <button
            onClick={handleScreenShare}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            <span className="material-icons">screen_share</span>
          </button>
        ) : (
          <button
            onClick={handleScreenShare}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            <span className="material-icons">stop_screen_share</span>
          </button>
        )}
        <button
          onClick={recording ? handleStopRecording : handleStartRecording}
          className={`bg-${recording ? 'red' : 'green'}-500 hover:bg-${recording ? 'red' : 'green'}-700 text-white font-bold py-2 px-4 rounded mr-4`}
        >
          {recording ? (
            <span className="material-icons">stop</span>
          ) : (
            <span className="material-icons">fiber_manual_record</span>
          )}
        </button>
        <button
          onClick={handleEndCall}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          End Call
        </button>
      </div>
      <div className="mt-4 text-gray-700 dark:text-gray-400">
        Room: {roomNumber}
      </div>
    </div>
  );
};

export default Room;
