import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select,useToast } from '@chakra-ui/react';
import modelData from '../../models/model.json'
import { sendInput } from '../../utils';
import { useWriteInputBoxAddInput } from "../../hooks/generated";
import { v4 as uuidv4 } from 'uuid';

interface JoinTournamentFormModalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinTournament: (dataToSend: any) => void;
  tournamentId: string;
}

const JoinTournamentFormModal = ({ isOpen, onClose,onJoinTournament, tournamentId}: JoinTournamentFormModalModalProps) => {

    const toast = useToast();

    const [accountIndex] = useState(0);

    const [tournamentData, setTournamentData] = useState({
      name: '',
      model: ''
    });
  
    const handleInputChange = (e: any) => {
      const { name, value } = e.target;
      setTournamentData({
        ...tournamentData,
        [name]: value,
      });
    };

    const handleSubmit = async (tournamentId: string) => {
        console.log(`Joining tournament with ID: ${tournamentId}`);

        const dataToSend = {
          method: "join_tournament",
          tournament_id: parseInt(tournamentId),
          ...tournamentData
        };

        if (!dataToSend.model){
            delete (dataToSend as any).model
        }

        onJoinTournament(dataToSend);

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
                value={tournamentData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </FormControl>
  
            <FormControl mt={4}>
            <FormLabel> Model Name</FormLabel>
            <Select
                name="model"
                value={tournamentData.model}
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
            <Button colorScheme="green" mr={3} onClick={() => handleSubmit(tournamentId)}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default JoinTournamentFormModal;