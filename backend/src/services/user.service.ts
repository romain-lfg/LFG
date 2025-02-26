import { supabase, User } from '../config/supabase.js';

/**
 * User service for handling user operations
 */
export class UserService {
  /**
   * Sync user data with the database
   * Creates a new user if they don't exist, updates if they do
   */
  async syncUser(userData: {
    id: string;
    walletAddress?: string;
    email?: string;
    metadata?: Record<string, any>;
  }): Promise<User | null> {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            wallet_address: userData.walletAddress || existingUser.wallet_address,
            email: userData.email || existingUser.email,
            metadata: userData.metadata ? { ...existingUser.metadata, ...userData.metadata } : existingUser.metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating user:', error);
          return null;
        }
        
        return updatedUser;
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            id: userData.id,
            wallet_address: userData.walletAddress || null,
            email: userData.email || null,
            metadata: userData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating user:', error);
          return null;
        }
        
        return newUser;
      }
    } catch (error) {
      console.error('Error in syncUser:', error);
      return null;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error getting user by ID:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }
  
  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error) {
        console.error('Error getting user by wallet address:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error in getUserByWalletAddress:', error);
      return null;
    }
  }
  
  /**
   * Update user data
   */
  async updateUser(userData: {
    id: string;
    walletAddress?: string;
    email?: string;
    metadata?: Record<string, any>;
  }): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          wallet_address: userData.walletAddress,
          email: userData.email,
          metadata: userData.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }
}
