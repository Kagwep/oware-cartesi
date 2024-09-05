import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Container,
  Flex,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  keyframes
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const BeadAnimation = () => {
  const beadColor = useColorModeValue('orange.500', 'orange.300');
  return (
    <Box
      as={motion.div}
      animation={`${rotateAnimation} 10s linear infinite`}
      width="20px"
      height="20px"
      borderRadius="full"
      bg={beadColor}
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
    />
  );
};

const CreativeAbout = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'slate.100');
  const accentColor = useColorModeValue('cyan.500', 'orange.300');

  return (
    <Box minHeight="100vh" py={12} color={'cyan.100'}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Flex direction="column" align="center" textAlign="center">
            <Heading as="h1" size="2xl" mb={6} color={accentColor}>
              Discover Oware: The Game of Stars
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Oware has been played for centuries under the vast, starry sky.
            </Text>
          </Flex>

          <Box position="relative" height="300px">
            <Image
              src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1725526055/sqyxhfsxq2zyh0qaz7rr.webp"
              alt="Night Sky"
              objectFit="cover"
              w="100%"
              h="100%"
              borderRadius="lg"
            />
            {/* {[...Array(12)].map((_, i) => (
              <BeadAnimation key={i} />
            ))} */}
          </Box>

          <Button
            colorScheme="cyan"
            size="lg"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? "Hide Oware Instructions" : "Reveal Oware Instructions"}
          </Button>

          {showInstructions && (
            <Text fontSize="lg" fontStyle="italic">
              Oware is played on a board with 12 hollows, 6 on each side. The game starts with 4 seeds in each hollow.
              Players take turns picking up all seeds from one of their hollows and distributing them counter-clockwise,
              one in each subsequent hollow. The goal is to capture more seeds than your opponent.
            </Text>
          )}

          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    The Cosmic Board
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                The Oware board consists of 12 hollows, 6 on each player's side, like the 12 months of the year.
                Each hollow begins with 4 seeds, totaling 48 seeds in play. These seeds represent the stars in our cosmic game.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    The Dance of Seeds
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                On your turn, choose a non-empty hollow on your side. Pick up all seeds from this hollow and sow them
                counter-clockwise, one in each subsequent hollow. If you have more than 12 seeds, skip the starting hollow in the next round.
                If your last seed lands in a hollow on your side with seeds, continue sowing from there.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    The Harvest
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Capture seeds when your last seed lands in an opponent's hollow that then contains 2 or 3 seeds.
                You also capture seeds from preceding hollows if they contain 2 or 3 seeds. However, if a move would
                capture all of your opponent's seeds, the capture is forfeited. The game ends when one player has captured
                25 or more seeds, or when both players agree that no further captures are possible.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Text fontSize="xl" textAlign="center" fontWeight="bold">
            Are you ready to play among the stars and test your cosmic strategy?
          </Text>

          <Link to={"/play"}>
          <Button colorScheme="cyan" size="lg" alignSelf="center">
            Begin Your Oware Journey
          </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreativeAbout;