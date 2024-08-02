import React, { useState } from 'react'
import { usePeerContext } from './PeerContext'
import { useSocketContext } from './SocketContext'

const usePlayer = ({ roomId }) => {
    const { myId } = usePeerContext()
    const [players, setPlayers] = useState({})
    const { socket } = useSocketContext()
    const userEmail = localStorage.getItem('userEmail');

    const unmuteAudio = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    muted: true
                }
            }
            return updatedPlayers
        })
        socket.emit('user-unmute-audio', { myId, roomId, userEmail })
    }

    const muteAudio = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    muted: true
                }
            }
            return updatedPlayers
        })
        socket.emit('user-mute-audio', { myId, roomId, userEmail })
    }

    const pauseVideo = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    playing: false
                }
            }
            return updatedPlayers
        })
        socket.emit('user-pause-video', { myId, roomId, userEmail })
    }

    const playVideo = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    playing: true
                }
            }
            return updatedPlayers
        })
        socket.emit('user-play-video', { myId, roomId, userEmail })
    }


    const screenShareON = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    screenSharing: true
                }
            }
            return updatedPlayers
        })
        socket.emit('user-screenshare-on', { myId, roomId, userEmail })
    }

    const screenShareOFF = () => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = {
                ...prevPlayers,
                [myId]: {
                    ...prevPlayers[myId],
                    screenSharing: false
                }
            }
            return updatedPlayers
        })
        socket.emit('user-screenshare-off', { myId, roomId, userEmail })
    }



    return { players, setPlayers, screenShareON, screenShareOFF, playVideo, pauseVideo, muteAudio, unmuteAudio }
}

export default usePlayer
