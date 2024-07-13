import React, { useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { socket_api } from '../../GlobalKey/GlobalKey';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

const VideoCall = () => {
  const socket = io(socket_api);
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [meetingCode, setMeetingCode] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  socket.on("hello socket", (arg) => {
    console.log(arg);
  });

  const handleNewMeeting = () => {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('user_id');
    const roomCode = uuidv4();

    console.log('New meeting created', { userId, userName, userEmail, roomCode });
    Swal.fire({
      title: 'New Meeting Created',
      html: `
        <p>Meeting Code: <strong>${roomCode}</strong></p>
        <button id="copyMeetingCode" class="swal2-confirm swal2-styled" style="background-color: #3085d6; color: white; border: none; border-radius: 4px; padding: 0.5em 1em;">Copy</button>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const copyButton = document.getElementById('copyMeetingCode');
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(roomCode).then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
              text: 'Meeting code has been copied to clipboard',
              showConfirmButton: false,
              timer: 1500
            });
            setMeetingCode(''); // Clear the input field after copying
          });
        });
      }
    });

    socket.emit("room:join", { userEmail, roomCode });
    handleJoinMeeting(roomCode);
  };

  const handleJoinMeeting = (meetingCode) => {
    setLoading(true); // Activate loading indicator

    // Simulate a 2-second delay before opening the room
    setTimeout(() => {
      console.log('Joining meeting with code:', meetingCode);
      const roomId = meetingCode;
      window.open(`/room/${roomId}`, '_blank');
      setLoading(false); // Turn off loading indicator
      setMeetingCode(''); // Clear the input field after copying
    }, 2000);
  };

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
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            className="p-2 rounded text-gray-800 border mr-2 dark:text-gray-800"
          />
          <button
            onClick={() => handleJoinMeeting(meetingCode)}
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
