import React from 'react'
import { Challenge } from '../utils/types'
import { Box,Text } from '@chakra-ui/react'

const ListChallenges = ({challenges}:{challenges:Challenge[]}) => {
  return (
    <>
    {challenges.length > 0 ? (
        challenges.map((challenge: Challenge, index:number) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="gray.700">
            <Text fontWeight="bold">Challenge ID: {challenge.challenge_id}</Text>
            <Text>Creator: {challenge.creator}</Text>
            <Text>Opponent: {challenge.opponent}</Text>
            <Text>In Progress: {challenge.in_progress ? 'Yes' : 'No'}</Text>
            <Text>Game Ended: {challenge.game_ended ? 'Yes' : 'No'}</Text>
            <Text>Winner: {challenge.winner ? challenge.winner : 'N/A'}</Text>
            <Text>Board State: {challenge.state}</Text>
          </Box>
        ))
      ) : (
        <Text>No challenges available at the moment.</Text>
      )}
    </>
  )
}

export default ListChallenges