import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PeerContext = createContext(null);

export const usePeerContext = () => useContext(PeerContext);

export const PeerContextProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478"
        ]
      }
    ]
  }), []);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAnswer = async (answer) => {
    await peer.setRemoteDescription(answer);
  };

  const handleTrackEvent = useCallback((event) => {
    const [stream] = event.streams;
    setRemoteStream(stream);
  }, []);

  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent);
    return () => {
      peer.removeEventListener('track', handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  const value = { peer, createOffer, createAnswer, setRemoteAnswer, remoteStream };

  return (
    <PeerContext.Provider value={value}>
      {props.children}
    </PeerContext.Provider>
  );
};