import React, { useCallback, useEffect } from 'react';
import { useSocketContext } from './SocketContext';
import { usePeerContext } from './PeerContext';
import { useParams } from 'react-router-dom';

const RoomPage = () => {
  const { socket } = useSocketContext();
  const { createOffer, createAnswer } = usePeerContext();
  const { roomId } = useParams();

  const handleNewUserJoined = useCallback(async (data) => {
    console.log('new user joined', data);
    const { userEmail } = data;
    const offer = await createOffer();
    console.log(offer);
    socket.emit('signal', { offer, userEmail });
  }, [createOffer, socket]);


  const handleIncomingSignal = useCallback(
    async (data) => {
      console.log('handle incoming signal', data);
      const { offer, fromEmail } = data;
      const answer = await createAnswer(offer);
      socket.emit('signal-accepted', { answer, userEmail: fromEmail });
    }, [createAnswer, socket]);

  useEffect(() => {
    console.log("Setting up incoming-signal listener");
    socket.on('incoming-signal', handleIncomingSignal);
    return () => {
      console.log("Removing incoming-signal listener");
      socket.off('incoming-signal', handleIncomingSignal);
    };
  }, [socket, handleIncomingSignal]);


  useEffect(() => {

    socket.on('new-user-joined', handleNewUserJoined);

    return () => {
      socket.off('new-user-joined', handleNewUserJoined);
    };
  }, [socket, handleNewUserJoined]);

  return (
    <div>
      <h1>RoomPage</h1>
      {/* Add your room page content here */}
    </div>
  );
};

export default RoomPage;
