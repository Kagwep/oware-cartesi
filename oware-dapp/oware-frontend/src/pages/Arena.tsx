import React from 'react'
import OwareGame from '../components/game/Oware'
import { Challenge } from '../utils/types'

const Arena = ({chalengeInfo, selectedTournamentId}:{chalengeInfo: Challenge, selectedTournamentId: string | null}) => {
  return (
    <OwareGame initialChallengeInfo={chalengeInfo} selectedTournamentId={selectedTournamentId}/>
  )
}

export default Arena