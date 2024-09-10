import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react';
import { Activity } from 'lucide-react';

interface AIMatchProgressModalProps {
    isOpen: boolean,
    onClose: () => void;
    progress: number,
    agentOne: string,
    agentTwo:string,
}

const AIMatchProgressModal = ({ isOpen, onClose, progress, agentOne, agentTwo}: AIMatchProgressModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Match in Progress</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Activity size={24} />
              <Text fontWeight="bold">{agentOne} vs {agentTwo}</Text>
            </HStack>
            <Progress value={progress} size="lg" colorScheme="blue" />
            <Text textAlign="center">{progress}% complete</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose} isDisabled={progress < 100}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AIMatchProgressModal;