import React, { useState } from 'react';
import { Routes, Route,useLocation } from 'react-router-dom';
import WithSubnavigation from './components/common/Navbar';
import CallToActionWithVideo from './pages/Home';
import SmallCentered from './components/common/Footer';
import GamePage from './pages/GamePage';
import Tournaments from './pages/Tournaments';
import Challenges from './pages/Challenges';
import LeaderBoard from './pages/LeaderBoard';
import "./App.css"

function App() {
    const location = useLocation();
  
    const isGamePage = location.pathname === '/play';
  
    return (
      <div className="app-container">
      <div className="content-wrapper">
        {!isGamePage && (
          <WithSubnavigation 
          />
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CallToActionWithVideo />} />
            <Route path="/play" element={<GamePage />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/challenges" element={<Challenges />} />
          </Routes>
        </main>
      </div>
      {!isGamePage && <SmallCentered />}
    </div>
    );
  }
  
  export default App;