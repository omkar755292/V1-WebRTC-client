import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePeerContext } from './PeerContext';
import { useSocketContext } from './SocketContext';

const Room = () => {
  const { socket } = useSocketContext();
  const { peer, createOffer, createAnswer, setRemoteAnswer, addRemoteStream } = usePeerContext();
  const hostVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { roomId } = useParams();
  const [isLocalFullScreen, setIsLocalFullScreen] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  const handleUserConnected = useCallback(async (data) => {
    console.log('User connected:', data);
    const { userEmail } = data;
    if (peer) {
      const offer = await createOffer();
      socket.emit('offer', { userEmail, roomId, offer });
    }
  }, [peer, createOffer, socket, roomId]);

  const handleReceiveOffer = useCallback(async ({ userId, offer }) => {
    if (peer) {
      const answer = await createAnswer(offer);
      socket.emit('answer', { roomId, answer });
    }
  }, [peer, createAnswer, socket, roomId]);

  const handleReceiveAnswer = useCallback(({ answer }) => {
    if (peer) {
      setRemoteAnswer(answer);
    }
  }, [peer, setRemoteAnswer]);

  const handleReceiveRemoteStream = useCallback((stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  useEffect(() => {
    socket.on('user-connected', handleUserConnected);
    socket.on('receive-offer', handleReceiveOffer);
    socket.on('receive-answer', handleReceiveAnswer);
    socket.on('remote-stream', handleReceiveRemoteStream);

    return () => {
      socket.off('user-connected', handleUserConnected);
      socket.off('receive-offer', handleReceiveOffer);
      socket.off('receive-answer', handleReceiveAnswer);
      socket.off('remote-stream', handleReceiveRemoteStream);
    };
  }, [socket, handleUserConnected, handleReceiveOffer, handleReceiveAnswer, handleReceiveRemoteStream]);

  useEffect(() => {
    if (hostVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          hostVideoRef.current.srcObject = stream;
          stream.getTracks().forEach(track => peer.addTrack(track, stream));
        })
        .catch(error => console.error('Error accessing media devices.', error));
    }
  }, [peer]);

  const toggleVideoDisplay = () => {
    setIsLocalFullScreen(!isLocalFullScreen);
  };

  const handleMuteToggle = () => {
    if (hostVideoRef.current) {
      hostVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (hostVideoRef.current) {
      hostVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoPaused(!isVideoPaused);
    }
  };

  const handleEndCall = () => {
    if (hostVideoRef.current) {
      hostVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    peer.destroy();
    socket.emit('leave-room', { roomId });
    console.log('Call ended');
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-full h-full">
        {isLocalFullScreen ? (
          <div className="w-full h-full relative">
            <video
              ref={hostVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              onClick={toggleVideoDisplay}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
              Local
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-cover"
              onClick={toggleVideoDisplay}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
              Remote
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 left-4 text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md">
        Meeting Code: {roomId}
      </div>
      <div className="absolute bottom-4 flex space-x-4">
        <button
          onClick={handleVideoToggle}
          className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-500"
        >
          {isVideoPaused ? (
            <span className="material-icons">videocam_off</span>
          ) : (
            <span className="material-icons">videocam</span>
          )}
        </button>
        <button
          onClick={handleMuteToggle}
          className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-500"
        >
          {isMuted ? (
            <span className="material-icons">mic_off</span>
          ) : (
            <span className="material-icons">mic</span>
          )}
        </button>
        <button
          onClick={handleEndCall}
          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500"
        >
          <span className="material-icons">call_end</span>
        </button>
      </div>
    </div>
  );
};

export default Room;
