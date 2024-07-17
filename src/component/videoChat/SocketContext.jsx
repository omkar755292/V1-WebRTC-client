import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = (props) => {

    const socket = useMemo(
        () => {
            const socketInstance = io('http://localhost:5002');
            console.log('socket connected', socketInstance);
            return socketInstance;
        }, []);

    const value = { socket };

    return (
        <SocketContext.Provider value={value}>
            {props.children}
        </SocketContext.Provider>
    );
};
