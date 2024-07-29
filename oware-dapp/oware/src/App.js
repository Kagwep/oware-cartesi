import "./App.css";

import React, { useState, useEffect } from "react";
import { Flex, Spacer } from "@chakra-ui/react";
import { LiaEthernetSolid } from "react-icons/lia";
import {ethers} from 'ethers'
import { Radio, RadioGroup,Stack ,Center} from '@chakra-ui/react';
import CreateChallenge from "./components/CreateChallenge";
import WithSubnavigation from "./components/Navbar";
import oware from "./components/oware";

// Simple App to present the Input field and produced Notices
function App() {

    const [signer,setSigner] = useState(undefined);
    const [noWallet, SetNoWallet] = useState("")
    const [connected, setConnection] = useState(false)
    const [challengeSelected, setChallengeSelected] = useState(false)


    

    return (
        <div className="App">
            <p>{noWallet}</p>
            <WithSubnavigation connected={connected} setConnection={setConnection} signer={signer} setSigner={setSigner}/>
            <CreateChallenge signer={signer} />
            {
                challengeSelected && connected ? (
                    <oware />
                ): (
                    <Center  h='100px' color='green'>
                        Select or create challenge to start
                    </Center>
                )
            }

        </div>
    );
}

export default App;
