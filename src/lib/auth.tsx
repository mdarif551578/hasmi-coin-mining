
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HASMI-${code}`;
};

const createUserDocument = async (user: User) => {
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        createUserDocument(user);
      }
      setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          createUserDocument(user);
        }
      })
      .catch((error) => {
        console.error("Google sign-in redirect error:", error);
      }).finally(() => {
         setLoading(false);
      });

    return () => unsubscribe();
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
    // The user document is now created by the onAuthStateChanged listener
    return {};
  } catch (error) {
    return { error };
  }
};

export const signIn = async (email:string, password: string): Promise<{ error?: any }> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return {};
  } catch (error) {
    return { error };
  }
};

export const signInWithGoogle = async (): Promise<{ error?: any }> => {
  const provider = new GoogleAuthProvider();
  try {
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
