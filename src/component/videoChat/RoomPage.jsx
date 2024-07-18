import React, { useCallback, useEffect, useRef, useState } from 'react';
import useMediaStream from './hookcontext/MediaStream';
import { useParams } from 'react-router-dom';
import { useSocketContext } from './hookcontext/SocketContext';
import { usePeerContext } from './hookcontext/PeerContext';

const RoomPage = () => {
  const { roomId } = useParams();
  const { stream } = useMediaStream();
  const { peer } = usePeerContext();
  const { socket } = useSocketContext();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState({});
  const videoRefs = useRef({});
  const username = localStorage.getItem('userName');

  useEffect(() => {
    if (!username) {
      localStorage.setItem('userName', 'Host');
    }
  }, [username]);

  const handleUserConnected = useCallback((data) => {
    console.log('User connected:', data);
    const { id } = data;
    const call = peer.call(id, stream);

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', id);
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [id]: { stream: incomingStream, muted: true, playing: true }
      }));
    });
  }, [peer, stream]);

  const handleCall = useCallback((call) => {
    const { peer: callerId } = call;
    console.log('Incoming call from', callerId);
    call.answer(stream);

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, sending stream to', callerId);
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [callerId]: { stream: incomingStream, muted: true, playing: true }
      }));
    });
  }, [stream]);

  useEffect(() => {
    peer.on('call', handleCall);
    socket.on('user-connected', handleUserConnected);

    return () => {
      peer.off('call', handleCall);
      socket.off('user-connected', handleUserConnected);
    };
  }, [socket, peer, handleUserConnected, handleCall]);

  const toggleMute = (userId) => {
    if (userId === 'local') {
      setMuted(!muted);
    } else {
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [userId]: { ...prevStreams[userId], muted: !prevStreams[userId].muted }
      }));
    }
  };

  const togglePlay = (userId) => {
    if (userId === 'local') {
      setPlaying(!playing);
    } else {
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [userId]: { ...prevStreams[userId], playing: !prevStreams[userId].playing }
      }));
    }
  };

  const endCall = () => {
    console.log('Ending call...');
  };

  useEffect(() => {
    return () => {
      Object.keys(videoRefs.current).forEach(id => {
        videoRefs.current[id].srcObject = null;
        delete videoRefs.current[id];
      });
    };
  }, []);

  const setVideoRef = (id, ref) => {
    if (ref) {
      videoRefs.current[id] = ref;
      ref.srcObject = remoteStreams[id].stream;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className={`w-full h-full relative ${!playing ? 'bg-black' : ''}`}>
          {playing && stream && (
            <video
              ref={video => video && (video.srcObject = stream)}
              autoPlay
              muted={muted}
              className="w-full h-full object-cover"
            />
          )}
          {!playing && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white bg-black bg-opacity-75">
              <span className="text-3xl font-bold">{username ? username : 'Local'}</span>
            </div>
          )}
        </div>
      </div>

      {Object.keys(remoteStreams).map(id => (
        <div key={id} className={`absolute top-4 right-4 w-1/4 h-1/4 bg-gray-900 rounded-lg shadow-lg`}>
          {remoteStreams[id].playing && (
            <video
              ref={video => setVideoRef(id, video)}
              autoPlay
              muted={remoteStreams[id].muted}
              className="object-cover w-full h-full rounded-lg"
            />
          )}
          {!remoteStreams[id].playing && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white bg-black bg-opacity-75">
              <span className="text-3xl font-bold">Remote User</span>
            </div>
          )}
        </div>
      ))}

      <div className="absolute bottom-4 left-4 text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md">
        <span className="mr-2">Meeting Code: {roomId}</span>
        <button onClick={() => toggleMute('local')} className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none">
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={() => togglePlay('local')} className="px-3 py-1 ml-2 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none">
          {playing ? 'Pause' : 'Play'}
        </button>
        <button onClick={endCall} className="px-3 py-1 ml-2 bg-red-500 text-white rounded-lg shadow-md focus:outline-none">
          End Call
        </button>
      </div>
    </div>
  );
};

export default RoomPage;
