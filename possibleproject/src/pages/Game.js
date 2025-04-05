import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { botService } from '../services/botService';
import '../styles/Game.css';

const Game = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const bot = botService.BOT;
  const [showMoney, setShowMoney] = useState(true);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    startNewHand();
  }, []);

  const startNewHand = () => {
    const newGameState = gameService.initializeGame(gameState);
    setGameState(newGameState);
    
    // If bot is small blind, process their action immediately
    if (!newGameState.isPlayerTurn) {
      const updatedState = gameService.processBotAction(newGameState, bot);
      setGameState(updatedState);
      setMessages([`New hand started. ${updatedState.dealer === 'bot' ? bot.name : 'You'} is the dealer. ${updatedState.dealer === 'bot' ? 'You posted the big blind ($20). Bot posted the small blind ($10).' : 'You posted the small blind ($10). Bot posted the big blind ($20).'} ${updatedState.isPlayerTurn ? 'Your turn.' : 'Bot\'s turn.'}`]);
    } else {
      setMessages([`New hand started. ${newGameState.dealer === 'bot' ? bot.name : 'You'} is the dealer. ${newGameState.dealer === 'bot' ? 'You posted the big blind ($20). Bot posted the small blind ($10).' : 'You posted the small blind ($10). Bot posted the big blind ($20).'} ${newGameState.isPlayerTurn ? 'Your turn.' : 'Bot\'s turn.'}`]);
    }
    
    setShowRaiseSlider(false);
  };

  const handlePlayerAction = (action) => {
    if (!gameState || !gameState.isPlayerTurn || gameState.gameOver) return;

    let newState = gameService.processAction(gameState, action, raiseAmount);
    setGameState(newState);

    if (action === 'FOLD') {
      setMessages(['You folded. Bot wins the pot.']);
      return;
    }

    if (action === 'RAISE') {
      setShowRaiseSlider(false);
    }

    // Check if game is over after player action
    if (newState.gameOver) {
      handleGameOver(newState.winner === 'player');
      return;
    }

    if (!newState.gameOver) {
      // Process bot's action immediately after player's action
      newState = gameService.processBotAction(newState, bot);
      setGameState(newState);

      // Check if game is over after bot action
      if (newState.gameOver) {
        handleGameOver(newState.winner === 'player');
        return;
      }

      // Check if round is complete
      if (gameService.isRoundComplete(newState)) {
        newState = gameService.advanceRound(newState);
        setGameState(newState);

        if (newState.round === 'showdown') {
          showDown();
        } else {
          // If bot is small blind, process their action immediately
          if (!newState.isPlayerTurn) {
            newState = gameService.processBotAction(newState, bot);
            setGameState(newState);
            
            // Check if game is over after bot action
            if (newState.gameOver) {
              handleGameOver(newState.winner === 'player');
              return;
            }
            
            setMessages([`Community cards dealt. ${newState.round.toUpperCase()} round. Bot acted. Your turn.`]);
          } else {
            setMessages([`Community cards dealt. ${newState.round.toUpperCase()} round. Your turn.`]);
          }
        }
      } else {
        const lastBotAction = newState.botActions[newState.botActions.length - 1];
        if (lastBotAction) {
          switch (lastBotAction.type) {
            case 'CALL':
              setMessages([`Bot called ${formatAmount(lastBotAction.amount)}. Your turn.`]);
              break;
            case 'RAISE':
              setMessages([`Bot raised to ${formatAmount(lastBotAction.amount)}. Your turn.`]);
              break;
            case 'CHECK':
              setMessages(['Bot checked. Your turn.']);
              break;
            case 'FOLD':
              setMessages(['Bot folded. You win the pot!']);
              break;
            default:
              setMessages(['Bot acted. Your turn.']);
          }
        }
      }
    }
  };

  const handleGameOver = (isPlayerWinner) => {
    setGameOver(true);
    setWinner(isPlayerWinner ? 'player' : 'bot');
    setMessages([isPlayerWinner ? 'Congratulations! You won the game!' : `Game Over! ${bot.name} won the game!`]);
  };

  const returnToMultiplayer = () => {
    navigate('/multiplayer');
  };

  const showDown = () => {
    if (!gameState.playerCards || !gameState.botCards || !gameState.communityCards) {
      setMessages(['Error: Cards not properly dealt']);
      return;
    }

    const playerHand = gameService.evaluateHand(gameState.playerCards, gameState.communityCards);
    const botHand = gameService.evaluateHand(gameState.botCards, gameState.communityCards);

    let winner = null;
    if (playerHand.rank > botHand.rank) {
      winner = 'player';
    } else if (botHand.rank > playerHand.rank) {
      winner = 'bot';
    } else {
      winner = playerHand.highCard > botHand.highCard ? 'player' : 'bot';
    }

    // Update the winner's stack with the pot amount
    const updatedState = {
      ...gameState,
      gameOver: true,
      winner,
      showBotCards: true,
      playerStack: winner === 'player' ? gameState.playerStack + gameState.pot : gameState.playerStack,
      botStack: winner === 'bot' ? gameState.botStack + gameState.pot : gameState.botStack
    };

    setGameState(updatedState);

    // Check if either player is out of chips
    if (updatedState.playerStack <= 0) {
      handleGameOver(false);
      return;
    }
    if (updatedState.botStack <= 0) {
      handleGameOver(true);
      return;
    }

    if (winner === 'player') {
      setMessages([`You win the pot of ${formatAmount(gameState.pot)}!`]);
    } else if (winner === 'bot') {
      setMessages([`${bot.name} wins the pot of ${formatAmount(gameState.pot)}.`]);
    } else {
      setMessages(['It\'s a tie!']);
    }
  };

  // Helper function to format amounts
  const formatAmount = (amount) => {
    if (!amount) return '0';
    if (showMoney) {
      return `$${amount}`;
    } else {
      return `${(amount / 20).toFixed(1)}BB`; // 20 is the big blind amount
    }
  };

  return (
    <div className="game-container">
      {gameOver ? (
        <div className="game-over-screen">
          <h2>{winner === 'player' ? 'Congratulations!' : 'Game Over!'}</h2>
          <p>{winner === 'player' ? 'You won the game!' : `${bot.name} won the game!`}</p>
          <button onClick={returnToMultiplayer}>Return to Multiplayer</button>
        </div>
      ) : (
        <>
          <div className="game-header">
            <h2>Playing against {bot.name}</h2>
            <div className="dealer-indicator">
              Dealer: {gameState?.dealer === 'bot' ? bot.name : 'You'}
            </div>
            <button 
              onClick={() => setShowMoney(!showMoney)}
              className="toggle-display"
              title={showMoney ? "Show in Big Blinds" : "Show in Money"}
            >
              {showMoney ? "BB" : "$"}
            </button>
          </div>

          <div className="debug-info">
            <p>Round: {gameState?.round}</p>
            <p>Player Turn: {gameState?.isPlayerTurn ? 'Yes' : 'No'}</p>
            <p>Current Bet: {formatAmount(gameState?.currentBet)}</p>
            <p>Player Total Bet: {formatAmount(gameState?.playerTotalBet)}</p>
            <p>Bot Total Bet: {formatAmount(gameState?.botTotalBet)}</p>
            <p>Last Player Action: {gameState?.playerActions[gameState?.playerActions.length - 1]?.type || 'None'}</p>
            <p>Last Bot Action: {gameState?.botActions[gameState?.botActions.length - 1]?.type || 'None'}</p>
          </div>

          <div className="game-board">
            <div className="bot-area">
              <div className="player-info">
                <h3>{bot.name}</h3>
                <p>{formatAmount(gameState?.botStack)}</p>
                <p>Total Bet: {formatAmount(gameState?.botTotalBet)}</p>
              </div>
              <div className="cards">
                {gameState?.botCards.map((card, index) => (
                  <div 
                    key={index} 
                    className={`card ${gameState.showBotCards ? 'face-up' : 'face-down'}`}
                    data-suit={card.suit}
                  >
                    {gameState.showBotCards ? `${card.value}${card.suit}` : '?'}
                  </div>
                ))}
              </div>
            </div>

            <div className="community-cards">
              {gameState?.communityCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`card face-up`}
                  data-suit={card.suit}
                >
                  {card.value}{card.suit}
                </div>
              ))}
            </div>

            <div className="player-area">
              <div className="player-info">
                <h3>You</h3>
                <p>{formatAmount(gameState?.playerStack)}</p>
                <p>Total Bet: {formatAmount(gameState?.playerTotalBet)}</p>
              </div>
              <div className="cards">
                {gameState?.playerCards.map((card, index) => (
                  <div 
                    key={index} 
                    className={`card face-up`}
                    data-suit={card.suit}
                  >
                    {card.value}{card.suit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="game-controls">
            <div className="pot-display">
              Pot: {formatAmount(gameState?.pot)}
            </div>
            
            {showRaiseSlider && (
              <div className="raise-slider">
                <input
                  type="range"
                  min={gameService.calculateMinRaise(gameState?.currentBet, gameState?.lastRaise)}
                  max={gameService.calculateMaxRaise(gameState?.playerStack)}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                  step="1"
                />
                <div className="raise-amount">
                  Raise to: {formatAmount(raiseAmount)}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                onClick={() => handlePlayerAction('FOLD')}
                disabled={!gameState?.isPlayerTurn || gameState?.gameOver}
              >
                Fold
              </button>
              <button 
                onClick={() => handlePlayerAction('CALL')}
                disabled={!gameState?.isPlayerTurn || gameState?.gameOver || gameState?.currentBet === gameState?.playerTotalBet}
              >
                Call {formatAmount(gameState?.currentBet - gameState?.playerTotalBet)}
              </button>
              <button 
                onClick={() => {
                  if (showRaiseSlider) {
                    handlePlayerAction('RAISE');
                  } else {
                    setRaiseAmount(gameState?.currentBet + gameService.calculateMinRaise(gameState?.currentBet, gameState?.lastRaise));
                    setShowRaiseSlider(true);
                  }
                }}
                disabled={!gameState?.isPlayerTurn || gameState?.gameOver}
              >
                {showRaiseSlider ? 'Confirm Raise' : 'Raise'}
              </button>
              <button 
                onClick={() => handlePlayerAction('CHECK')}
                disabled={!gameState?.isPlayerTurn || gameState?.gameOver || gameState?.currentBet > gameState?.playerTotalBet}
              >
                Check
              </button>
            </div>
          </div>

          <div className="game-message">
            {messages.join('\n')}
          </div>

          {gameState?.gameOver && (
            <div className="game-over">
              <button onClick={startNewHand}>Start New Hand</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Game; 