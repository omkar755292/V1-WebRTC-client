import React, { useState } from 'react'

const usePlayer = (myId) => {
    const [players, setPlayers] = useState({})
    return { players, setPlayers }
}

export default usePlayer