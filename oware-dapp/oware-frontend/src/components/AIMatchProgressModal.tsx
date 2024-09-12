import { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Progress, Button,Text } from "@chakra-ui/react";

interface GameStartModalProps {
  isOpen: boolean,
  onClose: () => void;
  onCountdownComplete: () => void;

}

const GameStartModal = ({ isOpen, onClose, onCountdownComplete}: GameStartModalProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0); // Reset progress
      let interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1.66 : 100)); // Increment progress
      }, 1000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        onCountdownComplete(); // Call when the countdown finishes
      }, 60000); // 1 minute

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, onCountdownComplete]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Playing</ModalHeader>
        <ModalBody>
          <p>The tournament will end about  1 minute...</p>
          <Progress value={progress} size="lg" />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="red">Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GameStartModal;
