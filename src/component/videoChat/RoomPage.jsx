import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import useMediaStream from './hookcontext/MediaStream';
import { useSocketContext } from './hookcontext/SocketContext';
import { usePeerContext } from './hookcontext/PeerContext';
import usePlayer from './hookcontext/playerHook';

const RoomPage = () => {
  const { roomId } = useParams();
  const { stream } = useMediaStream();
  const { myId, peer } = usePeerContext();
  const { socket } = useSocketContext();
  const { players, setPlayers } = usePlayer();
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const userEmail = localStorage.getItem('userEmail');

  const handleUserConnected = useCallback((data) => {
    console.log('User connected:', data);
    const { id, userEmail } = data;
    const call = peer.call(id, stream, { metadata: { userEmail } });

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', userEmail);
      setPlayers((prev) => ({
        ...prev,
        [id]: {
          url: incomingStream,
          muted: false,
          playing: true,
          userEmail: userEmail,
        },
      }));
    });
  }, [peer, stream, setPlayers]);

  const handleCall = useCallback((call) => {
    const { peer: callerId, metadata } = call;
    console.log('Incoming call from', callerId);
    call.answer(stream);

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', callerId);
      setPlayers((prev) => ({
        ...prev,
        [callerId]: {
          url: incomingStream,
          muted: false,
          playing: true,
          userEmail: metadata.userEmail, // Use userEmail from metadata
        },
      }));
    });
  }, [stream, setPlayers]);

  useEffect(() => {
    peer.on('call', handleCall);
    socket.on('user-connected', handleUserConnected);

    return () => {
      peer.off('call', handleCall);
      socket.off('user-connected', handleUserConnected);
    };
  }, [peer, socket, handleUserConnected, handleCall]);

  useEffect(() => {
    if (!stream || !myId) return;

    console.log(`Setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: false,
        playing: true,
        userEmail: userEmail,
      },
    }));

    return () => {
      // Clean up if needed
    };
  }, [stream, myId, setPlayers, userEmail]);

  const toggleMute = (userId) => {
    if (userId === 'local') {
      setMuted((prev) => !prev);
    } else {
      // Handle mute for remote users if needed
    }
  };

  const togglePlay = (userId) => {
    if (userId === 'local') {
      setPlaying((prev) => !prev);
    } else {
      // Handle play/pause for remote users if needed
    }
  };

  const endCall = (userId) => {
    console.log('Ending call...', userId);
    // Implement logic to end the call
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-800 dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="w-full flex items-center justify-center h-full relative">
          {Object.keys(players).map((playerId) => {
            const { url, muted, playing, userEmail } = players[playerId];
            return (
              <div key={playerId} className="relative w-full h-full">
                <ReactPlayer
                  url={url}
                  muted={muted}
                  playing={playing}
                  height="100%"
                  width="100%"
                />
                <div className="absolute top-16 left-4 text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md">
                  <span>{userEmail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md">
        <span className="mr-2">Meeting Code: {roomId}</span>
      </div>

      <div className="absolute bottom-4 text-gray-700 p-2 rounded-lg shadow-md">
        <button
          onClick={() => toggleMute('local')}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none"
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={() => togglePlay('local')}
          className="px-3 py-1 ml-2 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => endCall('local')}
          className="px-3 py-1 ml-2 bg-red-500 text-white rounded-lg shadow-md focus:outline-none"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default RoomPage;
