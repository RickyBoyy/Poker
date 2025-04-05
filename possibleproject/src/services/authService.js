import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';

export const authService = {
  // Register a new user
  register: async (username, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: username
      });
      // Store username in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username: username,
        email: email
      });
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(authService.getErrorMessage(error.code));
    }
  },

  // Login user with email or username
  login: async (identifier, password) => {
    try {
      console.log('Attempting login with identifier:', identifier);
      
      // First try to login with the identifier as email
      try {
        console.log('Trying email login...');
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        console.log('Email login successful');
        return userCredential.user;
      } catch (emailError) {
        console.log('Email login failed, trying username...');
        // If email login fails, try to find the email associated with the username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', identifier));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log('Username found, attempting login with associated email');
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
          console.log('Username login successful');
          return userCredential.user;
        } else {
          console.log('No matching username found');
          throw emailError;
        }
      }
    } catch (error) {
      console.error('Login error details:', error);
      throw new Error(authService.getErrorMessage(error.code));
    }
  },

  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(authService.getErrorMessage(error.code));
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(authService.getErrorMessage(error.code));
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!auth.currentUser;
  },

  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or try logging in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email or username. Please check your credentials or register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}; 