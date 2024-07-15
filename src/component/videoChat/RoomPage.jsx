import React, { useCallback, useEffect, useState } from 'react';
import { useSocketContext } from './SocketContext';
import { usePeerContext } from './PeerContext';

const RoomPage = () => {
  const { socket } = useSocketContext();
  const { createOffer, createAnswer, setRemoteAnswer } = usePeerContext();

  const handleHello = useCallback(async (data) => {
    console.log('New user joined: ', data);
    const { userEmail, socketId, roomId } = data;
    const toEmail = userEmail;
    const fromEmail = localStorage.getItem('userEmail');
    const offer = await createOffer();
    socket.emit('call-user', { offer, toEmail, fromEmail, socketId });
    console.log(socket);
  }, [createOffer, socket]);

  const handleIncomingCall = useCallback( (data) => {
    console.log('Incoming call from: ', data);
    const { offer, fromEmail } = data;
    
  }, [createAnswer, socket]);

  const handleUserConnected = useCallback(async (data) => {
    const { socketId, roomId } = data;
    console.log('user connected', data)
  }, []);


  useEffect(() => {

    socket.on('incoming-call', handleIncomingCall);

    return () => {

      socket.off('incoming-call', handleIncomingCall);
    }
  }, [handleIncomingCall, socket, handleHello, handleUserConnected])

  useEffect(() => {

    socket.on('hello', handleHello);
    socket.on('user-connected', handleUserConnected);

    return () => {
      socket.off('user-connected', handleUserConnected);
      socket.off('hello', handleHello);
    };
  }, [socket, handleHello, handleUserConnected]);

  return (
    <div>
      <h1>RoomPage</h1>
    </div>
  );
};

export default RoomPage;
