import React from 'react'
import OwareGame from '../components/game/Oware'

const GamePage = ({chalengeInfo}:{chalengeInfo:any}) => {
  return (
    <OwareGame initialChallengeInfo={chalengeInfo} />
  )
}

export default GamePage