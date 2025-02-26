import { supabase, User } from '../config/supabase';

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

      const now = new Date().toISOString();

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            wallet_address: userData.walletAddress || existingUser.wallet_address,
            email: userData.email || existingUser.email,
            metadata: userData.metadata || existingUser.metadata,
            updated_at: now
          })
          .eq('id', userData.id)
          .select()
          .single();

        if (error) throw error;
        return updatedUser;
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            id: userData.id,
            wallet_address: userData.walletAddress,
            email: userData.email,
            metadata: userData.metadata,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();

        if (error) throw error;
        return newUser;
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return null;
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(
    userId: string, 
    metadata: Record<string, any>
  ): Promise<User | null> {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', userId)
        .single();

      // Merge existing metadata with new metadata
      const updatedMetadata = {
        ...(existingUser?.metadata || {}),
        ...metadata
      };

      const { data, error } = await supabase
        .from('users')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user metadata:', error);
      return null;
    }
  }
}
