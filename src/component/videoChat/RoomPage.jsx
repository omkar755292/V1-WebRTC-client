import React, { useCallback, useEffect, useRef, useState } from 'react';
import useMediaStream from './hookcontext/MediaStream';
import { useParams } from 'react-router-dom';
import { useSocketContext } from './hookcontext/SocketContext';
import { usePeerContext } from './hookcontext/PeerContext';
import ReactPlayer from 'react-player';
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
      setPlayers((prev) => (
        {
          ...prev,
          [id]: {
            url: incomingStream,
            muted: false,
            playing: true
          }
        }
      ));

    });
  }, [peer, stream]);


  const handleCall = useCallback((call) => {
    const { peer: callerId } = call;
    console.log('Incoming call from', callerId);
    call.answer(stream);

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', callerId);
      setPlayers((prev) => (
        {
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false,
            playing: true
          }
        }
      ));

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


  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => (
      {
        ...prev,
        [myId]: {
          url: stream,
          muted: false,
          playing: true
        }
      }
    ));

    return () => {

    }
  }, [myId, setPlayers, stream])


  const toggleMute = (userId) => {

  };

  const togglePlay = (userId) => {

  };

  const endCall = (userId) => {
    console.log('Ending call...', userId);
  };


  return (
    <div>
      {Object.keys(players).map((playerId) => {
        const { url, muted, playing } = players[playerId]
        return <ReactPlayer key={playerId} url={url} muted={muted} playing={playing} />
      })}
    </div>
  );
};

export default RoomPage;
