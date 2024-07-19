import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import useMediaStream from './hookcontext/MediaStream';
import { useSocketContext } from './hookcontext/SocketContext';
import { usePeerContext } from './hookcontext/PeerContext';
import usePlayer from './hookcontext/playerHook';

const RoomPage = () => {
  const { roomId } = useParams();
  const { stream, loading, error } = useMediaStream();
  const { myId, peer } = usePeerContext();
  const { socket } = useSocketContext();
  const { players, setPlayers, toggleAudio, toggleVideo } = usePlayer({ roomId });
  const [users, setUsers] = useState([]);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const handleUserConnected = useCallback((data) => {
    console.log('User connected:', data);
    const { id, email } = data;
    const call = peer.call(id, stream, { metadata: { email: userEmail } });

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', data);
      setPlayers((prev) => ({
        ...prev,
        [id]: {
          url: incomingStream,
          muted: true,
          playing: false,
          email: email,
        },
      }));

      setUsers((prev) => ({
        ...prev,
        [id]: call
      }))

    });
  }, [peer, stream, setPlayers, userEmail]);

  const handleCall = useCallback((call) => {
    const { peer: callerId, metadata } = call;
    console.log('Incoming call from', callerId);
    call.answer(stream, { metadata: { email: userEmail } });

    call.on('stream', (incomingStream) => {
      console.log('Call accepted, incoming stream from', callerId);
      setPlayers((prev) => ({
        ...prev,
        [callerId]: {
          url: incomingStream,
          muted: true,
          playing: false,
          email: metadata.email,
        },
      }));


      setUsers((prev) => ({
        ...prev,
        [callerId]: call
      }))

    });
  }, [stream, setPlayers, userEmail]);

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
        muted: true,
        playing: false,
        email: userEmail,
      },
    }));

    return () => {
      // Clean up if needed
    };
  }, [stream, myId, setPlayers, userEmail]);

  const handleToggleMute = useCallback((data) => {
    const { userEmail, userId } = data;
    console.log('toggle audio call for user', userEmail);

    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [userId]: {
          ...prevPlayers[userId],
          muted: !prevPlayers[userId]?.muted
        }
      }
      return updatedPlayers
    })
  }, [setPlayers]);

  const handleTogglePause = useCallback((data) => {
    const { userEmail, userId } = data;
    console.log('toggle video call for user', userEmail);

    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [userId]: {
          ...prevPlayers[userId],
          playing: !prevPlayers[userId]?.playing
        }
      }
      return updatedPlayers
    })
  }, [setPlayers]);


  const endCall = useCallback(() => {
    console.log('Ending call...');
    socket.emit('end-call', { myId, userEmail, roomId });
    if (peer) {
      peer.destroy(); // or peer.close(), depending on your peer library
    }
    navigate('/video-call');

  }, [peer, navigate]);


  const handleUserLeave = useCallback((data) => {
    const { userEmail, userId } = data;
    console.log('User left the call:', userEmail);

    // Close the user's stream or connection
    if (users[userId]) {
        users[userId].close();
        delete users[userId];
    }

    // Remove the user from the players list
    setPlayers((prevPlayers) => {
        const updatedPlayers = { ...prevPlayers };
        delete updatedPlayers[userId];

        return updatedPlayers;
    });

}, [users, setPlayers]);

  useEffect(() => {
    socket.on('user-toggle-audio', handleToggleMute);
    socket.on('user-toggle-video', handleTogglePause);
    socket.on('user-leave', handleUserLeave);

    return () => {
      socket.off('user-leave', handleUserLeave);
      socket.off('user-toggle-audio', handleToggleMute);
      socket.off('user-toggle-video', handleTogglePause);
    };
  }, [socket, handleToggleMute, handleTogglePause, handleUserLeave]);

  const toggleScreenSharing = () => {
    setScreenSharing((prev) => !prev);
    console.log(screenSharing ? 'Ending screen share' : 'Starting screen share');

  };

  const toggleScreenRecording = () => {
    setScreenRecording((prev) => !prev);
    console.log(screenRecording ? 'Stopping screen recording' : 'Starting screen recording');

  };

  if (error) return <div className="text-black">Error: {error.message}</div>;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-800">
      {loading ? (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-full flex items-center justify-center h-full relative">
              {Object.keys(players).map((playerId) => {
                const { url, muted, playing, email } = players[playerId];
                return (
                  <div key={playerId} className="relative h-full w-full">
                    {playing ?
                      <div className="relative h-full w-full">

                        <div className="absolute text-grey-700 bg-white p-2 rounded-lg shadow-md">
                          <span>{email}</span>
                        </div>
                        <ReactPlayer
                          url={url}
                          muted={muted}
                          playing={playing}
                          height="100%"
                          width="100%"
                        // className="absolute top-0 left-0"
                        />
                      </div> : <div className="flex h-full w-full items-center justify-center w-full h-full bg-gray-800 text-white text-center">
                        <span className="text-xl font-semibold">{email}</span>
                      </div>}
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
              onClick={() => {
                toggleAudio()
                setMuted((prev) => !prev);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none"
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={() => {
                toggleVideo()
                setPlaying((prev) => !prev);
              }}
              className="px-3 py-1 ml-2 bg-blue-500 text-white rounded-lg shadow-md focus:outline-none"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={toggleScreenSharing}
              className={`px-3 py-1 ml-2 ${screenSharing ? 'bg-red-500' : 'bg-green-500'} text-white rounded-lg shadow-md focus:outline-none`}
            >
              Screen Share {screenSharing ? 'on' : 'off'}
            </button>
            <button
              onClick={toggleScreenRecording}
              className={`px-3 py-1 ml-2 ${screenRecording ? 'bg-red-500' : 'bg-yellow-500'} text-white rounded-lg shadow-md focus:outline-none`}
            >
              Screen Recording {screenRecording ? 'on' : 'off'}
            </button>
            <button
              onClick={endCall}
              className="px-3 py-1 ml-2 bg-red-500 text-white rounded-lg shadow-md focus:outline-none"
            >
              End Call
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomPage;
