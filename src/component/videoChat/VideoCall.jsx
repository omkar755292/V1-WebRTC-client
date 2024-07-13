import React, { useRef, useState } from 'react';

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [meetingCode, setMeetingCode] = useState('');

  const handleNewMeeting = () => {
    // Logic to create a new meeting
    console.log('New meeting created');
  };

  const handleJoinMeeting = () => {
    // Logic to join a meeting with the entered code
    console.log('Joining meeting with code:', meetingCode);
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
            onClick={handleJoinMeeting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
