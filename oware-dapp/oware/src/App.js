import React, { useState } from 'react';
import { Routes, Route,useLocation } from 'react-router-dom';
import WithSubnavigation from './components/common/Navbar';
import CallToActionWithVideo from './pages/Home';
import SmallCentered from './components/common/Footer';
import GamePage from './pages/GamePage';
import Tournaments from './pages/Tournaments';
import Challenges from './pages/Challenges';
import LeaderBoard from './pages/LeaderBoard';

function App() {
    const [connected, setConnection] = useState(false);
    const [signer, setSigner] = useState(null);
    const location = useLocation();
  
    const isGamePage = location.pathname === '/play';
  
    return (
      <div className="App">
        {!isGamePage && (
          <WithSubnavigation 
            connected={connected} 
            setConnection={setConnection} 
            signer={signer} 
            setSigner={setSigner}
          />
        )}
        <Routes>
          <Route path="/" element={<CallToActionWithVideo />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/challenges" element={<Challenges />} />
        </Routes>
        {!isGamePage && <SmallCentered />}
      </div>
    );
  }
  
  export default App;