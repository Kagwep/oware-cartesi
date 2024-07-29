import React, {useState} from 'react';
import { Button,useToast,Select, Heading,Center } from '@chakra-ui/react';
import { sendInput } from '../utils';


function CreateChallenge({signer}){

    const [loading, setLoading] =  useState(false)
    const toast = useToast()
    

    async function createChallenge(){

        await sendInput(
            JSON.stringify({
                method: "create_challenge"
            }),
            signer,
            toast
        )

    }


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