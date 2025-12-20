'use server';

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function signUp(formData) {
  try {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required' };
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account',
    };
  }
}

export async function signIn(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in',
    };
  }
}

export async function signOut() {
  cookies().delete('auth-token');
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const token = cookies().get('auth-token')?.value;
    
    if (!token) {
      return { success: false, user: null };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return { success: false, user: null };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    return { success: false, user: null };
  }
}
