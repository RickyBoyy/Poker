import { GAME_RULES } from './gameRules';

// Card values and suits
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠', '♥', '♦', '♣'];

// Single bot personality
export const BOT = {
  name: 'Gustavo',
  description: 'A straightforward poker player who plays tight-aggressive.',
  image: 'https://i.imgur.com/example.jpg',
  difficulty: 'Medium'
};

// Evaluate hand strength (simplified)
const evaluateHandStrength = (holeCards, communityCards) => {
  if (!holeCards || !communityCards) return 0;
  
  const allCards = [...holeCards, ...communityCards];
  const values = allCards.map(card => VALUES.indexOf(card.value));
  
  // Count pairs and trips
  const valueCounts = {};
  values.forEach(value => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });
  
  // Check for pairs and trips
  const pairs = Object.values(valueCounts).filter(count => count === 2).length;
  const trips = Object.values(valueCounts).filter(count => count === 3).length;
  
  // Simple hand strength calculation
  let strength = 0;
  if (trips > 0) strength = 0.8;
  else if (pairs > 0) strength = 0.5;
  else strength = Math.max(...values) / 12; // Normalize to 0-1 range
  
  return strength;
};

// Calculate pot odds
const calculatePotOdds = (currentBet, pot) => {
  return currentBet / (pot + currentBet);
};

export const botService = {
  BOT,
  
  makeDecision: (gameState) => {
    if (!gameState.botCards) {
      return { type: 'CHECK', amount: 0 };
    }
    
    const handStrength = evaluateHandStrength(gameState.botCards, gameState.communityCards);
    const potOdds = calculatePotOdds(gameState.currentBet, gameState.pot);
    
    // Pre-flop strategy
    if (gameState.round === 'preflop') {
      if (handStrength > 0.7) {
        return { type: 'RAISE', amount: Math.min(gameState.botStack, gameState.currentBet * 3) };
      } else if (handStrength > 0.4) {
        return { type: 'CALL', amount: gameState.currentBet };
      } else {
        return { type: 'FOLD', amount: 0 };
      }
    }
    
    // Post-flop strategy
    if (handStrength > 0.8) {
      return { type: 'RAISE', amount: Math.min(gameState.botStack, gameState.pot) };
    } else if (handStrength > 0.6) {
      return { type: 'CALL', amount: gameState.currentBet };
    } else if (handStrength > 0.3 && potOdds < 0.3) {
      return { type: 'CALL', amount: gameState.currentBet };
    } else {
      return { type: 'FOLD', amount: 0 };
    }
  }
}; 