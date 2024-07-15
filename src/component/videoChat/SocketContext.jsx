import React, { createContext, useContext, useMemo } from 'react';
import { socket_api } from '../../GlobalKey/GlobalKey';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = (props) => {

    const socket = useMemo(() => {
        const socketInstance = io(socket_api);
        console.log('Socket initialized:', socketInstance);
        return socketInstance;
    }, []);

    const value = { socket };

    return (
        <SocketContext.Provider value={value}>
            {props.children}
        </SocketContext.Provider>
    );
};
