import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { useSocketContext } from './SocketContext';

const VideoCall = () => {
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoomJoin = useCallback(
    (data) => {

      const { roomId } = data;
      console.log(data);

      setLoading(true);
      setTimeout(() => {
        console.log('Joining meeting with code:', roomId);
        navigate(`/room/${roomId}`);
        setLoading(false);
        setRoomId('');
      }, 2000);

    }, [navigate]
  );

  const handleRoomCreate = useCallback(
    (data) => {

      const { roomId } = data;
      console.log(data);

      setLoading(true);
      setTimeout(() => {
        console.log('Joining meeting with code:', roomId);
        navigate(`/room/${roomId}`);
        setLoading(false);
        setRoomId('');
      }, 2000);

    }, [navigate]
  );

  useEffect(() => {

    socket.on('user-connected', handleRoomJoin);
    socket.on('room-created', handleRoomCreate);

    return () => {
      socket.off('user-connected', handleRoomJoin);
      socket.off('room-created', handleRoomCreate);
    };

  }, [socket]);

  const handleJoinMeeting = useCallback((roomId) => {

    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    socket.emit("join-room", { userName, userEmail, roomId });

  }, []);

  const handleNewMeeting = useCallback(() => {

    const roomId = uuidv4();
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    Swal.fire({
      title: 'New Meeting Created',
      html: `
        <p>Meeting Code: <strong>${roomId}</strong></p>
        <button id="copyMeetingCode" class="swal2-confirm swal2-styled" style="background-color: #3085d6; color: white; border: none; border-radius: 4px; padding: 0.5em 1em;">Copy</button>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const copyButton = document.getElementById('copyMeetingCode');
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(roomId).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
              text: 'Meeting code has been copied to clipboard',
              showConfirmButton: false,
              timer: 1500
            });
            socket.emit("create-room", { roomId, userName, userEmail });
          });
        });
      }
    });
  }, []);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 p-4 dark:bg-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-2 text-center">Video Call and Meeting for Everyone</h1>
      <p className="text-lg mb-6 text-center">Connect, collaborate, and celebrate from anywhere with WebRTC</p>
      <div className="flex flex-col items-center">
        <div className="flex mb-4">
          <button
            onClick={handleNewMeeting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            New Meeting
          </button>
          <input
            type="text"
            placeholder="Enter Code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="p-2 rounded text-gray-800 border mr-2 dark:text-gray-800"
          />
          <button
            onClick={() => handleJoinMeeting(roomId)}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
