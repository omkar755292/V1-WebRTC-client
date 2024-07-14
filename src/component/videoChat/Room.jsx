import React, { useRef, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { socket_api } from '../../GlobalKey/GlobalKey';
import { useParams } from 'react-router-dom';
import { usePeerContext } from './PeerContext';

const socket = io(socket_api);

const Room = () => {
  const { peer, createOffer, createAnswer, setRemoteAnswer, remoteStream } = usePeerContext();
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isLocalFullScreen, setIsLocalFullScreen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const handleNewUserJoined = useCallback(async (data) => {
    const { userName, userEmail } = data;
    console.log('new user joined', userName, userEmail);
    const offer = await createOffer();
    socket.emit('call-user', { userEmail, userName, offer });
  }, [createOffer]);

  const handleIncommingCall = useCallback(async (data) => {
    const { from, offer } = data;
    console.log("incoming call from", from);
    const ans = await createAnswer(offer);
    socket.emit('call-accepted', { userEmail: from, ans });
  }, [createAnswer]);

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    console.log("handle call accepted", data);
    await setRemoteAnswer(ans);
  }, [setRemoteAnswer]);

  useEffect(() => {
    socket.on('user-joined', handleNewUserJoined);
    socket.on('incoming-call', handleIncommingCall);
    socket.on('call-accepted', handleCallAccepted);

    return () => {
      socket.off('user-joined', handleNewUserJoined);
      socket.off('incoming-call', handleIncommingCall);
      socket.off('call-accepted', handleCallAccepted);
    };
  }, [handleNewUserJoined, handleIncommingCall, handleCallAccepted]);

  const toggleVideoDisplay = () => {
    setIsLocalFullScreen(!isLocalFullScreen);
  };

  const handleMuteToggle = () => {
    if (localVideoRef.current) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localVideoRef.current) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => (track.enabled = !track.enabled));
      setIsVideoPaused(!isVideoPaused);
    }
  };

  const handleEndCall = () => {
    // Logic to end the call
    alert("End Call");
    console.log('Call ended');
  };

  useEffect(() => {
    // Access local camera and microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => peer.addTrack(track, stream));
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, [peer]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-full h-full">
        {isLocalFullScreen ? (
          <div className="w-full h-full relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              onClick={toggleVideoDisplay}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
              local
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
              remote
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-4 left-4 w-1/4 h-1/4">
        {isLocalFullScreen ? (
          <div className="w-full h-full relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-cover border-2 border-white"
              onClick={toggleVideoDisplay}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
              remote
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover border-2 border-white"
              onClick={toggleVideoDisplay}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
              local
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
