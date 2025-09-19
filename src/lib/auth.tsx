
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Function to generate a random referral code
const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234ranoS';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HASMI-${code}`;
};

const createUserDocument = async (user: User) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const { email, displayName, uid } = user;
        const referralCode = generateReferralCode();
        
        try {
            await setDoc(userDocRef, {
                email,
                displayName: displayName || 'User',
                phone: '',
                wallet_balance: 0,
                usd_balance: 0,
                referral_code: referralCode,
                referred_by: null,
                role: 'user',
                last_claim: null,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      setLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect.
          await createUserDocument(result.user);
          // The onAuthStateChanged listener will handle setting the user.
        }
      } catch (error) {
        console.error("Error processing redirect result:", error);
      } finally {
         // The onAuthStateChanged listener is the single source of truth.
         // It will set the user and setLoading(false) once the state is definitive.
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await createUserDocument(currentUser);
          setUser(currentUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = processAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const signUp = async (name: string, email:string, password: string): Promise<{ error?: any }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // createUserDocument is now called from onAuthStateChanged
    return {};
  } catch (error) {
    return { error };
  }
};

export const signInWithGoogle = async (): Promise<{ error?: any }> => {
  const provider = new GoogleAuthProvider();
  try {
    // This will start the redirect flow.
    await signInWithRedirect(auth, provider);
    return {};
  } catch (error) {
    return { error };
  }
};


export const signOut = async (): Promise<{ error?: any }> => {
  try {
    await firebaseSignOut(auth);
    return {};
  } catch (error) {
    return { error };
  }
};

export const resetPassword = async (email: string): Promise<{ error?: any }> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return {};
    } catch (error) {
        return { error };
    }
}

    