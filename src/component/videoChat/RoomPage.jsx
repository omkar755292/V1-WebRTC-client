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
  const username = localStorage.getItem('userName');

  const handleUserConnected = useCallback((data) => {
    console.log('User connected:', data);
    const { id } = data;
    const call = peer.call(id, stream);

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', id);
      setPlayers((prev) => ({
        ...prev,
        [id]: {
          url: incomingStream,
          muted: false,
          playing: true,
        },
      }));
    });
  }, [peer, stream, setPlayers]);

  const handleCall = useCallback((call) => {
    const { peer: callerId } = call;
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

    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: false,
        playing: true,
      },
    }));

    return () => {
      // Clean up if needed
    };
  }, [stream, myId, setPlayers]);

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
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="w-full h-full relative">
          {Object.keys(players).map((playerId) => {
            const { url, muted, playing } = players[playerId];
            return (
              <ReactPlayer
                key={playerId}
                url={url}
                muted={muted}
                playing={playing}
              />
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md">
        <span className="mr-2">Meeting Code: {roomId}</span>
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
