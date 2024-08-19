import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select,useToast } from '@chakra-ui/react';
import modelData from '../../models/model.json'
import { sendInput } from '../../utils';
import { useWriteInputBoxAddInput } from "../../hooks/generated";
import { v4 as uuidv4 } from 'uuid';

interface JoinChallengeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinChallenge: (dataToSend: any) => void;
  challengeId: string;
}

const JoinChallengeFormModal = ({ isOpen, onClose,onJoinChallenge, challengeId}: JoinChallengeFormModalProps) => {

    const toast = useToast();

    const [accountIndex] = useState(0);

    const [challengeData, setChallengeData] = useState({
      name: '',
      model: ''
    });
  
    const handleInputChange = (e: any) => {
      const { name, value } = e.target;
      setChallengeData({
        ...challengeData,
        [name]: value,
      });
    };

    const handleSubmit = async (challengeId: string) => {
        console.log(`Joining challenge with ID: ${challengeId}`);

        const dataToSend = {
          method: "accept_challenge",
          challenge_id: parseInt(challengeId),
          ...challengeData
        };

        if (!dataToSend.model){
            delete (dataToSend as any).creator_model_name
        }

        onJoinChallenge(dataToSend);

        onClose()

    };
  

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join a Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={challengeData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </FormControl>
  
            <FormControl mt={4}>
            <FormLabel> Model Name</FormLabel>
            <Select
                name="model"
                value={challengeData.model}
                onChange={handleInputChange}
            >
                <option value="">Select model name</option>
                {Object.keys(modelData).map((modelName) => (
                <option key={modelName} value={modelName}>
                    {modelName}
                </option>
                ))}
            </Select>
            </FormControl>
            
          </ModalBody>
  
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={() => handleSubmit(challengeId)}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default JoinChallengeFormModal;