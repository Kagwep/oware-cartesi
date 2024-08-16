import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select,useToast } from '@chakra-ui/react';
import modelData from '../../models/model.json'
import { sendInput } from '../../utils';
import { useWriteInputBoxAddInput } from "../../hooks/generated";
import { v4 as uuidv4 } from 'uuid';

interface ChallengeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeFormModal = ({ isOpen, onClose}: ChallengeFormModalProps) => {
    const toast = useToast();
    const [accountIndex] = useState(0);

    const [challengeData, setChallengeData] = useState({
      creator_name: '',
      rounds: '',
      challenge_type: '',
      creator_model_name: ''
    });
  
    const handleInputChange = (e: any) => {
      const { name, value } = e.target;
      setChallengeData({
        ...challengeData,
        [name]: value,
      });
    };
  
    const handleChallengeTypeChange = (e: any) => {
      const { value } = e.target;
      setChallengeData({
        ...challengeData,
        challenge_type: value,
        creator_model_name: '' // Reset model name when challenge type changes
      });
    };
  
    const { writeContractAsync } = useWriteInputBoxAddInput();

    const handleSubmit = async () => {
      const dataToSend = {
        method: "create_challenge",
        ...challengeData,
        rounds: parseInt(challengeData.rounds, 10),
        challenge_type: parseInt(challengeData.challenge_type, 10)
      };
      if (!dataToSend.creator_model_name) {
        delete (dataToSend as any).creator_model_name;
      }

      const toastId = uuidv4();
  
      toast({
        id: toastId,
        title: "Creating challenge",
        description: "Please wait...",
        status: "info",
        duration: null,
        isClosable: true,
      });

  
      try {
        const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
        if (result.success) {

          toast.update(toastId, {
            title: "Challenge created",
            description: "Your challenge has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose()
          // Additional success handling (e.g., reset form, close modal, etc.)
        } else {
          throw new Error("Failed to create challenge");
        }
      } catch (error) {
        console.error("Error creating challenge:", error);
        toast.update(toastId, {
          title: "Error",
          description: "Failed to create challenge. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        // Additional error handling if needed
      }
    };
  
    const challengeTypes = [
      { label: 'User vs User', value: 1 },
      { label: 'User vs AI', value: 2 },
      { label: 'AI vs AI', value: 3 },
    ];
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Creator Name</FormLabel>
              <Input
                name="creator_name"
                value={challengeData.creator_name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </FormControl>
  
            <FormControl mt={4}>
              <FormLabel>Rounds</FormLabel>
              <Input
                name="rounds"
                value={challengeData.rounds}
                onChange={handleInputChange}
                placeholder="Enter number of rounds"
              />
            </FormControl>
  
            <FormControl mt={4}>
              <FormLabel>Challenge Type</FormLabel>
              <Select
                name="challenge_type"
                value={challengeData.challenge_type}
                onChange={handleChallengeTypeChange}
              >
                <option value="">Select challenge type</option>
                {challengeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>
  
            {(challengeData.challenge_type === '2' || challengeData.challenge_type === '3') && (
              <FormControl mt={4}>
                <FormLabel>Creator Model Name</FormLabel>
                <Select
                  name="creator_model_name"
                  value={challengeData.creator_model_name}
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
            )}
          </ModalBody>
  
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={() => handleSubmit()}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default ChallengeFormModal;