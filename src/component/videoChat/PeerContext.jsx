import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PeerContext = createContext(null);

export const usePeerContext = () => useContext(PeerContext);

export const PeerContextProvider = (props) => {
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

  const [iceCandidates, setIceCandidates] = useState([]);

  useEffect(() => {
    const handleIceConnectionStateChange = () => {
      console.log(`ICE connection state: ${peer.iceConnectionState}`);
    };

    const handleConnectionStateChange = () => {
      console.log(`Peer connection state: ${peer.connectionState}`);
    };

    const handleIceCandidate = (event) => {
      if (event.candidate) {
        setIceCandidates((prev) => [...prev, event.candidate]);
        console.log('New ICE candidate:', event.candidate);
      }
    };

    const handleIceGatheringStateChange = () => {
      console.log(`ICE gathering state: ${peer.iceGatheringState}`);
    };

    peer.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
    peer.addEventListener('connectionstatechange', handleConnectionStateChange);
    peer.addEventListener('icecandidate', handleIceCandidate);
    peer.addEventListener('icegatheringstatechange', handleIceGatheringStateChange);

    // Cleanup event listeners on unmount
    return () => {
      peer.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
      peer.removeEventListener('connectionstatechange', handleConnectionStateChange);
      peer.removeEventListener('icecandidate', handleIceCandidate);
      peer.removeEventListener('icegatheringstatechange', handleIceGatheringStateChange);
    };
  }, [peer]);

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

  const value = { peer, createOffer, createAnswer, setRemoteAnswer, iceCandidates };

  return (
    <PeerContext.Provider value={value}>
      {props.children}
    </PeerContext.Provider>
  );
};
