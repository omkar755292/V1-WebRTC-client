import React, { createContext, useState, useEffect, useContext } from 'react';
import Peer from 'peerjs';

const PeerContext = createContext();

export const usePeerContext = () => {
    return useContext(PeerContext);
};

export const PeerProvider = (props) => {
    const [peer, setPeer] = useState(null);
    const [myId, setMyId] = useState('');

    useEffect(() => {
        const initializePeer = async () => {
            const myPeer = new Peer();
            console.log('peer connected', myPeer);

            myPeer.on('open', (id) => {
                console.log('My peer ID is:', id);
                setMyId(id);
            });

            setPeer(myPeer);
        };

        initializePeer();

        return () => {
            if (peer) {
                peer.destroy();
                console.log('Peer instance destroyed');
            }
        };
    }, []);

    const value = { peer, myId };

    return (
        <PeerContext.Provider value={value}>
            {props.children}
        </PeerContext.Provider>
    );
};
