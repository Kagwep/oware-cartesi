import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select,useToast } from '@chakra-ui/react';
import modelData from '../../models/model.json'
import { sendInput } from '../../utils';
import { useWriteInputBoxAddInput } from "../../hooks/generated";
import { v4 as uuidv4 } from 'uuid';

interface ChallengeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchTournaments: () => Promise<void>;
}

const TouramentFormModal = ({ isOpen, onClose, fetchTournaments}: ChallengeFormModalProps) => {
    const toast = useToast();
    const [accountIndex] = useState(0);


    const [challengeData, setChallengeData] = useState({
      number_of_players: '',
      rounds_per_challenge: ''
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
        number_of_players: value,
      });
    };
  
    const { writeContractAsync } = useWriteInputBoxAddInput();

    const handleSubmit = async () => {
      const dataToSend = {
        method: "create_tournament",
        rounds_per_challenge: parseInt(challengeData.rounds_per_challenge, 10),
        number_of_players: parseInt(challengeData.number_of_players, 10)
      };

      const toastId = uuidv4();
  
      toast({
        id: toastId,
        title: "Creating tournament",
        description: "Please wait...",
        status: "info",
        duration: null,
        isClosable: true,
      });

  
      try {
        const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
        
        if (result.success) {

          toast.update(toastId, {
            title: "tournament created",
            description: "Your tournament has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose()
          // Additional success handling (e.g., reset form, close modal, etc.)

          await new Promise(resolve => setTimeout(resolve, 5000));

          await fetchTournaments()
   
        } else {
          throw new Error(`Failed to create tournament `);
        }
      } catch (error) {
        console.error("Error creating tournament:", error);
        toast.update(toastId, {
          title: "Error",
          description: "Failed to create tournament. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        // Additional error handling if needed
      }
    };

   // [4, 6, 8, 10, 12, 14, 16]
    const tournamentAllowablePlayers = [
      { label: '4', value: 4 },
      { label: '6', value: 6 },
      { label: '8', value: 8 },
      { label: '10', value: 10 },
      { label: '12', value: 12 },
      { label: '14', value: 14 },
      { label: '16', value: 16 },
    ];
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Tournament</ModalHeader>
          <ModalCloseButton />
          <ModalBody>

          <FormControl mt={4}>
              <FormLabel>Rounds per challenge</FormLabel>
              <Input
                name="rounds_per_challenge"
                value={challengeData.rounds_per_challenge}
                onChange={handleInputChange}
                placeholder="Enter number of rounds"
              />
            </FormControl>
  
            <FormControl mt={4}>
              <FormLabel>Number of players</FormLabel>
              <Select
                name="challenge_type"
                value={challengeData.number_of_players}
                onChange={handleChallengeTypeChange}
              >
                <option value="">Select challenge type</option>
                {tournamentAllowablePlayers.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>

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
  
  export default TouramentFormModal;
  