import { botService } from './botService';
import { GAME_RULES } from './gameRules';

// Card values and suits
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠', '♥', '♦', '♣'];

// Hand rankings
const HAND_RANKINGS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_A_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1
};

export const gameService = {
  // Create a new deck
  createDeck: () => {
    const deck = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push({ value, suit });
      }
    }
    return deck;
  },

  // Shuffle the deck
  shuffleDeck: (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  },

  // Deal initial cards
  dealInitialCards: (deck) => {
    const playerCards = [deck.pop(), deck.pop()];
    const botCards = [deck.pop(), deck.pop()];
    return { playerCards, botCards, deck };
  },

  // Deal community cards
  dealCommunityCards: (deck, round) => {
    const cardsToDeal = round === 'flop' ? 3 : 1;
    const communityCards = [];
    for (let i = 0; i < cardsToDeal; i++) {
      communityCards.push(deck.pop());
    }
    return { communityCards, deck };
  },

  // Evaluate a poker hand
  evaluateHand: (holeCards, communityCards) => {
    if (!holeCards || !communityCards) {
      return { rank: HAND_RANKINGS.HIGH_CARD, highCard: 0 };
    }

    // Combine hole cards and community cards into a single array
    const allCards = [...holeCards, ...communityCards];
    
    // Extract values and suits
    const values = allCards.map(card => VALUES.indexOf(card.value));
    const suits = allCards.map(card => card.suit);
    
    // Count occurrences of each value
    const valueCounts = {};
    values.forEach(value => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    // Check for flush
    const isFlush = suits.every(suit => suit === suits[0]);

    // Check for straight
    const sortedValues = [...new Set(values)].sort((a, b) => a - b);
    let isStraight = false;
    if (sortedValues.length >= 5) {
      for (let i = 0; i <= sortedValues.length - 5; i++) {
        if (sortedValues[i + 4] - sortedValues[i] === 4) {
          isStraight = true;
          break;
        }
      }
      // Check for Ace-low straight
      if (!isStraight && sortedValues.includes(12) && sortedValues.slice(0, 4).every((v, i) => v === i)) {
        isStraight = true;
      }
    }

    // Check for royal flush
    if (isFlush && isStraight && sortedValues.includes(12) && sortedValues.includes(11)) {
      return { rank: HAND_RANKINGS.ROYAL_FLUSH, highCard: 14 };
    }

    // Check for straight flush
    if (isFlush && isStraight) {
      return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, highCard: Math.max(...sortedValues) };
    }

    // Check for four of a kind
    const fourOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 4);
    if (fourOfAKind) {
      return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, highCard: parseInt(fourOfAKind[0]) };
    }

    // Check for full house
    const threeOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 3);
    const pair = Object.entries(valueCounts).find(([_, count]) => count === 2);
    if (threeOfAKind && pair) {
      return { rank: HAND_RANKINGS.FULL_HOUSE, highCard: parseInt(threeOfAKind[0]) };
    }

    // Check for flush
    if (isFlush) {
      return { rank: HAND_RANKINGS.FLUSH, highCard: Math.max(...values) };
    }

    // Check for straight
    if (isStraight) {
      return { rank: HAND_RANKINGS.STRAIGHT, highCard: Math.max(...sortedValues) };
    }

    // Check for three of a kind
    if (threeOfAKind) {
      return { rank: HAND_RANKINGS.THREE_OF_A_KIND, highCard: parseInt(threeOfAKind[0]) };
    }

    // Check for two pair
    const pairs = Object.entries(valueCounts).filter(([_, count]) => count === 2);
    if (pairs.length >= 2) {
      const pairValues = pairs.map(([value]) => parseInt(value));
      return { rank: HAND_RANKINGS.TWO_PAIR, highCard: Math.max(...pairValues) };
    }

    // Check for one pair
    if (pairs.length === 1) {
      return { rank: HAND_RANKINGS.ONE_PAIR, highCard: parseInt(pairs[0][0]) };
    }

    // High card
    return { rank: HAND_RANKINGS.HIGH_CARD, highCard: Math.max(...values) };
  },

  // Calculate pot odds
  calculatePotOdds: (currentBet, pot) => {
    return currentBet / (pot + currentBet);
  },

  // Calculate equity (simplified version)
  calculateEquity: (holeCards, communityCards, deck) => {
    // This is a simplified version - in a real implementation,
    // you'd want to use Monte Carlo simulation or pre-calculated equity tables
    const remainingCards = deck.length;
    const possibleOutcomes = 1000; // Number of simulations
    let wins = 0;

    for (let i = 0; i < possibleOutcomes; i++) {
      const shuffledDeck = [...deck];
      gameService.shuffleDeck(shuffledDeck);

      // Deal opponent's cards and remaining community cards
      const opponentCards = [shuffledDeck.pop(), shuffledDeck.pop()];
      const remainingCommunity = [];
      while (remainingCommunity.length < 5 - communityCards.length) {
        remainingCommunity.push(shuffledDeck.pop());
      }

      const allCommunity = [...communityCards, ...remainingCommunity];
      const playerHand = gameService.evaluateHand([...holeCards, ...allCommunity]);
      const opponentHand = gameService.evaluateHand([...opponentCards, ...allCommunity]);

      if (playerHand.rank > opponentHand.rank || 
          (playerHand.rank === opponentHand.rank && playerHand.highCard > opponentHand.highCard)) {
        wins++;
      }
    }

    return wins / possibleOutcomes;
  },

  // Initialize a new game with proper blinds and stack sizes
  initializeGame: (previousState = null) => {
    const deck = gameService.shuffleDeck(gameService.createDeck());
    const { playerCards, botCards, deck: remainingDeck } = gameService.dealInitialCards(deck);
    
    // Determine who is the dealer (alternates each hand)
    const isPlayerDealer = previousState ? previousState.dealer === 'player' : Math.random() < 0.5;
    
    // Get previous stacks or use initial values
    const previousPlayerStack = previousState ? previousState.playerStack : 500;
    const previousBotStack = previousState ? previousState.botStack : 500;
    
    // Initialize game state with proper blinds and dealer position
    const initialState = {
      deck: remainingDeck,
      playerCards,
      botCards,
      communityCards: [],
      pot: GAME_RULES.SMALL_BLIND + GAME_RULES.BIG_BLIND,
      playerStack: previousPlayerStack - (isPlayerDealer ? GAME_RULES.SMALL_BLIND : GAME_RULES.BIG_BLIND),
      botStack: previousBotStack - (isPlayerDealer ? GAME_RULES.BIG_BLIND : GAME_RULES.SMALL_BLIND),
      currentBet: GAME_RULES.BIG_BLIND,
      round: 'preflop',
      playerActions: [{ type: isPlayerDealer ? 'POST_SB' : 'POST_BB', amount: isPlayerDealer ? GAME_RULES.SMALL_BLIND : GAME_RULES.BIG_BLIND }],
      botActions: [{ type: isPlayerDealer ? 'POST_BB' : 'POST_SB', amount: isPlayerDealer ? GAME_RULES.BIG_BLIND : GAME_RULES.SMALL_BLIND }],
      isPlayerTurn: isPlayerDealer, // Small blind acts first pre-flop
      showBotCards: false,
      gameOver: false,
      winner: null,
      lastRaise: GAME_RULES.BIG_BLIND,
      rules: GAME_RULES,
      dealer: isPlayerDealer ? 'player' : 'bot',
      playerTotalBet: isPlayerDealer ? GAME_RULES.SMALL_BLIND : GAME_RULES.BIG_BLIND,
      botTotalBet: isPlayerDealer ? GAME_RULES.BIG_BLIND : GAME_RULES.SMALL_BLIND
    };

    return initialState;
  },

  // Validate a raise amount
  validateRaise: (amount, currentBet, lastRaise, stack) => {
    const minRaise = Math.max(currentBet + lastRaise, GAME_RULES.MIN_RAISE);
    const maxRaise = Math.min(stack, GAME_RULES.MAX_RAISE);
    
    if (amount < minRaise) {
      return { valid: false, message: `Minimum raise is $${minRaise}` };
    }
    if (amount > maxRaise) {
      return { valid: false, message: `Maximum raise is $${maxRaise}` };
    }
    return { valid: true };
  },

  // Calculate the minimum raise amount
  calculateMinRaise: (currentBet, lastRaise) => {
    return Math.max(currentBet + lastRaise, GAME_RULES.MIN_RAISE);
  },

  // Calculate the maximum raise amount
  calculateMaxRaise: (stack) => {
    return Math.min(stack, GAME_RULES.MAX_RAISE);
  },

  // Process a player action
  processAction: (gameState, action, amount = 0) => {
    const newState = { ...gameState };
    
    switch (action) {
      case 'FOLD':
        newState.gameOver = true;
        newState.winner = 'bot';
        newState.showBotCards = true;
        newState.playerActions.push({ type: 'FOLD' });
        break;

      case 'CALL':
        const callAmount = newState.currentBet - newState.playerTotalBet;
        if (callAmount > 0) {
          newState.playerStack -= callAmount;
          newState.pot += callAmount;
          newState.playerTotalBet += callAmount;
          newState.playerActions.push({ type: 'CALL', amount: callAmount });
          
          // Check if player is out of chips
          if (newState.playerStack <= 0) {
            newState.gameOver = true;
            newState.winner = 'bot';
            newState.showBotCards = true;
          }
        } else {
          newState.playerActions.push({ type: 'CHECK' });
        }
        newState.isPlayerTurn = false;
        break;

      case 'RAISE':
        const raiseAmount = Math.min(amount, newState.playerStack);
        const totalRaise = raiseAmount - newState.playerTotalBet;
        if (totalRaise > 0) {
          newState.playerStack -= totalRaise;
          newState.pot += totalRaise;
          newState.currentBet = raiseAmount;
          newState.lastRaise = totalRaise;
          newState.playerTotalBet = raiseAmount;
          newState.playerActions.push({ type: 'RAISE', amount: raiseAmount });
          
          // Check if player is out of chips
          if (newState.playerStack <= 0) {
            newState.gameOver = true;
            newState.winner = 'bot';
            newState.showBotCards = true;
          }
          
          newState.isPlayerTurn = false;
        }
        break;

      case 'CHECK':
        if (newState.currentBet === newState.playerTotalBet) {
          newState.playerActions.push({ type: 'CHECK' });
          newState.isPlayerTurn = false;
        }
        break;
    }

    return newState;
  },

  // Process a bot action
  processBotAction: (gameState, bot) => {
    const newState = { ...gameState };
    const botDecision = botService.makeDecision(bot, {
      ...gameState,
      position: gameState.dealer === 'bot' ? 'BTN' : 'BB',
      round: gameState.round
    });

    switch (botDecision.action) {
      case 'FOLD':
        newState.gameOver = true;
        newState.winner = 'player';
        newState.showBotCards = true;
        newState.botActions.push({ type: 'FOLD' });
        break;

      case 'CALL':
        const callAmount = newState.currentBet - newState.botTotalBet;
        if (callAmount > 0) {
          newState.botStack -= callAmount;
          newState.pot += callAmount;
          newState.botTotalBet += callAmount;
          newState.botActions.push({ type: 'CALL', amount: callAmount });
          
          // Check if bot is out of chips
          if (newState.botStack <= 0) {
            newState.gameOver = true;
            newState.winner = 'player';
            newState.showBotCards = true;
          }
        } else {
          newState.botActions.push({ type: 'CHECK' });
        }
        newState.isPlayerTurn = true;
        break;

      case 'RAISE':
        const raiseAmount = Math.min(botDecision.amount, newState.botStack);
        const totalRaise = raiseAmount - newState.botTotalBet;
        if (totalRaise > 0) {
          newState.botStack -= totalRaise;
          newState.pot += totalRaise;
          newState.currentBet = raiseAmount;
          newState.lastRaise = totalRaise;
          newState.botTotalBet = raiseAmount;
          newState.botActions.push({ type: 'RAISE', amount: raiseAmount });
          
          // Check if bot is out of chips
          if (newState.botStack <= 0) {
            newState.gameOver = true;
            newState.winner = 'player';
            newState.showBotCards = true;
          }
          
          newState.isPlayerTurn = true;
        }
        break;

      case 'CHECK':
        if (newState.currentBet === newState.botTotalBet) {
          newState.botActions.push({ type: 'CHECK' });
          newState.isPlayerTurn = true;
        }
        break;
    }

    return newState;
  },

  // Check if the current round is complete
  isRoundComplete: (gameState) => {
    const lastPlayerAction = gameState.playerActions[gameState.playerActions.length - 1];
    const lastBotAction = gameState.botActions[gameState.botActions.length - 1];

    if (!lastPlayerAction || !lastBotAction) return false;

    // If someone folded, round is complete
    if (lastPlayerAction.type === 'FOLD' || lastBotAction.type === 'FOLD') {
      return true;
    }

    // If both players have checked, round is complete
    if (lastPlayerAction.type === 'CHECK' && lastBotAction.type === 'CHECK') {
      return true;
    }

    // If both players have called the same amount, round is complete
    if (gameState.playerTotalBet === gameState.botTotalBet) {
      // If the last action was a call or check, round is complete
      if ((lastPlayerAction.type === 'CALL' || lastPlayerAction.type === 'CHECK') &&
          (lastBotAction.type === 'CALL' || lastBotAction.type === 'CHECK')) {
        return true;
      }
    }

    // If the last action was a raise and it was called, round is complete
    if (lastPlayerAction.type === 'RAISE' && lastBotAction.type === 'CALL' && 
        gameState.playerTotalBet === gameState.botTotalBet) {
      return true;
    }

    if (lastBotAction.type === 'RAISE' && lastPlayerAction.type === 'CALL' && 
        gameState.playerTotalBet === gameState.botTotalBet) {
      return true;
    }

    return false;
  },

  evaluatePreflopHand: (cards) => {
    // Convert card values to numerical values
    const valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const values = cards.map(card => valueMap[card.value]);
    const suits = cards.map(card => card.suit);
    
    // Check for pairs
    if (values[0] === values[1]) {
      return 0.8 + (values[0] / 100); // Higher pairs are stronger
    }
    
    // Check for suited cards
    const isSuited = suits[0] === suits[1];
    
    // Check for connected cards
    const isConnected = Math.abs(values[0] - values[1]) === 1;
    
    // Calculate base strength
    let strength = 0.3;
    if (isSuited) strength += 0.1;
    if (isConnected) strength += 0.1;
    strength += Math.max(...values) / 100;
    
    return strength;
  },

  evaluateHandStrength: (holeCards, communityCards) => {
    if (!holeCards || !communityCards) return 0;
    
    const allCards = [...holeCards, ...communityCards];
    const hand = gameService.evaluateHand(holeCards, communityCards);
    
    // Convert hand rank to strength (0-1)
    const baseStrength = hand.rank / 10;
    
    // Adjust strength based on high card
    const highCardValue = gameService.getCardValue(hand.highCard);
    const highCardAdjustment = highCardValue / 100;
    
    return Math.min(1, baseStrength + highCardAdjustment);
  },

  getCardValue: (card) => {
    const valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return valueMap[card.value];
  },

  advanceRound: (gameState) => {
    const newState = { ...gameState };
    
    // Reset betting state
    newState.currentBet = 0;
    newState.playerTotalBet = 0;
    newState.botTotalBet = 0;
    newState.lastRaise = 0;
    newState.playerActions = [];
    newState.botActions = [];
    
    // Deal community cards based on the round
    switch (gameState.round) {
      case 'preflop':
        newState.round = 'flop';
        newState.communityCards = gameState.deck.slice(0, 3);
        newState.deck = gameState.deck.slice(3);
        break;
      case 'flop':
        newState.round = 'turn';
        newState.communityCards = [...gameState.communityCards, gameState.deck[0]];
        newState.deck = gameState.deck.slice(1);
        break;
      case 'turn':
        newState.round = 'river';
        newState.communityCards = [...gameState.communityCards, gameState.deck[0]];
        newState.deck = gameState.deck.slice(1);
        break;
      case 'river':
        newState.round = 'showdown';
        newState.showBotCards = true;
        break;
    }
    
    // Set the first to act based on position (small blind acts first)
    // If dealer is bot, player is small blind and acts first
    // If dealer is player, bot is small blind and acts first
    newState.isPlayerTurn = newState.dealer === 'bot';
    
    return newState;
  },
}; 