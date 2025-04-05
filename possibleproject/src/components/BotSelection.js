import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { botService } from '../services/botService';
import '../styles/BotSelection.css';

const BotSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically select Gustavo and start the game
    const gustavo = botService.BOT;
    navigate('/game', { state: { bot: gustavo } });
  }, [navigate]);

  return null; // No need to render anything
};

export default BotSelection; 