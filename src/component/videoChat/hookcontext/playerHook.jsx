import React, { useState } from 'react'
import { usePeerContext } from './PeerContext'
import { useSocketContext } from './SocketContext'

const usePlayer = ({ roomId }) => {
    const { myId } = usePeerContext()
    const [players, setPlayers] = useState({})
    const { socket } = useSocketContext()
    const userEmail = localStorage.getItem('userEmail');

    const toggleAudio = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    muted: !prevPlayers[myId]?.muted
                }
            }
            return updatedPlayers
        })
        socket.emit('user-toggle-audio', { myId, roomId, userEmail })
    }

    const toggleVideo = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    playing: !prevPlayers[myId]?.playing
                }
            }
            return updatedPlayers
        })
        socket.emit('user-toggle-video', { myId, roomId, userEmail })
    }

    return { players, setPlayers, toggleAudio, toggleVideo }
}

export default usePlayer
