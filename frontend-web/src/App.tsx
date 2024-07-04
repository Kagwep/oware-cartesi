import React,{ useState } from 'react'
import OwareInput from './components/Play'
import Echoes from './components/Agent'
import { Flex, Spacer } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import './App.css'

import Home from "./pages/Home";
import LaunchGame from './pages/LaunchGame';

function App() {

  const [accountIndex] = useState(0);
  

  return (
    <>
               {/* <Flex>
                    <OwareInput  />
                    <Spacer />
                    <Echoes />
                </Flex> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<LaunchGame />} />
        </Routes>
    </>
  )
}

export default App
