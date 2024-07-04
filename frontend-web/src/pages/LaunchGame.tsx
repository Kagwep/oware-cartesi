import React,{useState,useCallback} from 'react'
import Canvas, { Players } from "../components/Game/Logic/Oware";


const LaunchGame = () => {
  const [username, setUsername] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);

  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState<Players[]>([]);
  const [players_identity, setPlayersIdentity] = useState<string>("player-1");

  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
    setPlayersIdentity("");
  }, []);

  return (
    <div>
          <Canvas
              room={room}
              orientation={orientation}
              username={username}
              players={players}
              player_identity={players_identity}
              // the cleanup function will be used by Game to reset the state when a game is over
              cleanup={cleanup}
          />
    </div>
  )
}

export default LaunchGame