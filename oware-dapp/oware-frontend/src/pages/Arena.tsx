import React from 'react'
import OwareGame from '../components/game/Oware'
import { Challenge } from '../utils/types'

const Arena = ({chalengeInfo}:{chalengeInfo: Challenge}) => {
  return (
    <OwareGame initialChallengeInfo={chalengeInfo} />
  )
}

export default Arena