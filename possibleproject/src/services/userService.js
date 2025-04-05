const USER_KEY = 'deepPokerUsers';
const CURRENT_USER_KEY = 'deepPokerCurrentUser';

// Initialize users array if it doesn't exist
const initializeUsers = () => {
  try {
    const users = localStorage.getItem(USER_KEY);
    if (!users) {
      localStorage.setItem(USER_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing users:', error);
    // Clear any corrupted data
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    // Try to initialize again
    localStorage.setItem(USER_KEY, JSON.stringify([]));
  }
};

// Call initialization
initializeUsers();

export const userService = {
  register: (userData) => {
    try {
      // Validate input
      if (!userData.username || !userData.password) {
        throw new Error('Username and password are required');
      }

      if (userData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Get existing users
      const users = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
      
      // Check if username already exists
      if (users.some(user => user.username === userData.username)) {
        throw new Error('Username already exists');
      }

      // Create new user with initial stats
      const newUser = {
        username: userData.username,
        password: userData.password, // In a real app, this would be hashed
        id: Date.now().toString(),
        chips: 1000, // Starting chips
        eloRating: 1500,
        gamesPlayed: 0,
        wins: 0,
        createdAt: new Date().toISOString()
      };

      // Add new user and save
      users.push(newUser);
      localStorage.setItem(USER_KEY, JSON.stringify(users));
      
      // Log the user in immediately after registration
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: (username, password) => {
    try {
      // Validate input
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const users = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return null;
      }

      // Store current user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      // Verify user still exists in the users list
      const users = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
      const userExists = users.some(u => u.id === user.id);
      
      if (!userExists) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  },

  updateUserStats: (userId, gameResult) => {
    try {
      const users = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) return null;

      const user = users[userIndex];
      user.gamesPlayed += 1;
      
      if (gameResult === 'win') {
        user.wins += 1;
        user.eloRating += 10;
        user.chips += 100; // Add chips for winning
      } else {
        user.eloRating = Math.max(1000, user.eloRating - 10);
        user.chips = Math.max(0, user.chips - 50); // Remove chips for losing
      }

      users[userIndex] = user;
      localStorage.setItem(USER_KEY, JSON.stringify(users));
      
      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Update user stats error:', error);
      return null;
    }
  }
}; 