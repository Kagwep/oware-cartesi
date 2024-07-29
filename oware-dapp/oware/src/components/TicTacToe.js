import React, { useState } from 'react';
import { ChakraProvider, Box, SimpleGrid, Button } from '@chakra-ui/react';

const oware = () => {
  const [board, setBoard] = useState(Array(9).fill(null));

  const handleClick = (index) => {
    console.log("Clicked position:", index);
    const newBoard = [...board];
    newBoard[index] = 'X'; // Example action, marking 'X' at the clicked position
    setBoard(newBoard);
  };

  return (
    <ChakraProvider>
      <SimpleGrid columns={3} spacing={2} width="300px" margin="0 auto" marginTop="50px">
        {board.map((value, index) => (
          <Box
            key={index}
            borderWidth="2px"
            borderRadius="md"
            width="100px"
            height="100px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              width="100%"
              height="100%"
              fontSize="2xl"
              onClick={() => handleClick(index)}
            >
              {value}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </ChakraProvider>
  );
};

export default oware;
