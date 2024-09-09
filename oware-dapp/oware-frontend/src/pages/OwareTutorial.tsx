import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Image,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const tutorialSlides = [
  {
    title: "Welcome to Oware",
    content: "This tutorial will guide you through the basics.",
    image: "/board.PNG"
  },
  {
    title: "The Board",
    content: "The game is played on a board with 12 houses (6 on each side). Your houses are at the bottom.",
    image: "/board.PNG"
  },
  {
    title: "Making a Move",
    content: "Click on one of your houses to select it. The house will turn yellow when selected. ** The house  must contain atleast one seed",
    image: "/board.PNG"
  },
  {
    title: "Seed Distribution",
    content: "Seeds are automatically distributed counter-clockwise, one in each subsequent house.",
    image: "/board.PNG"
  },
  {
    title: "Capturing Seeds",
    content: "If your last seed lands in an opponent's house and makes the total 2 or 3, you capture those seeds.",
    image: "/board.PNG"
  },
  {
    title: "Winning the Game",
    content: "The game ends when a player captures more than 24 seeds or no legal moves are possible.",
    image: "/board.PNG"
  }
];

const OwareTutorial = () => {
  const { isOpen: isOwareTutorialOpen, onOpen: onOwareTutorialOpen, onClose: OnCloseOwareTutorial } = useDisclosure();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tutorialSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tutorialSlides.length) % tutorialSlides.length);
  };

  return (
    <>
      <Button onClick={onOwareTutorialOpen} variant="outline" colorScheme="cyan" ml={2}>
        How to Play
      </Button>

      <Modal isOpen={isOwareTutorialOpen} onClose={OnCloseOwareTutorial} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>{tutorialSlides[currentSlide].title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Image src={tutorialSlides[currentSlide].image} alt={tutorialSlides[currentSlide].title} />
              <Text>{tutorialSlides[currentSlide].content}</Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={4}>
              <Button onClick={prevSlide} leftIcon={<ChevronLeftIcon />} >
                Previous
              </Button>
              <Text>
                {currentSlide + 1} / {tutorialSlides.length}
              </Text>
              <Button onClick={nextSlide} rightIcon={<ChevronRightIcon />}>
                Next
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OwareTutorial;