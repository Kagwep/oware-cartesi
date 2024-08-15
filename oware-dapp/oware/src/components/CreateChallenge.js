import React, {useState} from 'react';
import { Button,useToast,Select, Heading,Center } from '@chakra-ui/react';
import { sendInput } from '../utils';


function CreateChallenge({signer}){

    const [loading, setLoading] =  useState(false)
    const toast = useToast()

    const [challengeData, setChallengeData] = useState({
        creator_name: '',
        rounds: '',
        challenge_type: '',
        creator_model_name: ''
      });
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setChallengeData(prevData => ({
          ...prevData,
          [name]: value
        }));
      };

      const createChallenge = async () => {
        const dataToSend = {
          method: "create_challenge",
          ...challengeData,
          rounds: parseInt(challengeData.rounds, 10),
          challenge_type: parseInt(challengeData.challenge_type, 10)
        };
    
        try {
          await sendInput(
            JSON.stringify(dataToSend),
            signer,
            toast
          );
        } catch (error) {
          console.error("Error creating challenge:", error);
          // Handle error (e.g., show error message to user)
        }
      };


    async function handleSubmit(event){
        event.preventDefault()
        setLoading(true)
        await createChallenge()
        setLoading(false)
    }

    let buttonProps = {}

    if(loading) buttonProps.isLoading = true
  
    return (



        <Center bg='' h='100px' color='white'>
        <div className='createChallengeForm'>
                <form onSubmit={handleSubmit}>
                        <Button {...buttonProps} type='submit' colorScheme='purple'> Create Challenge </Button>
                </form>
            </div>
        </Center>
    
    );
    
        

}

export default CreateChallenge;