import { supabase, User } from '../config/supabase.js';
import { NillionService } from './nillion.service.js';

/**
 * User service for handling user operations
 */
export class UserService {
  private nillionService: NillionService;

  constructor() {
    this.nillionService = new NillionService();
  }
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
      console.log('👤 UserService: Syncing user data', {
        userId: userData.id,
        hasWalletAddress: !!userData.walletAddress,
        hasEmail: !!userData.email,
        hasMetadata: !!userData.metadata
      });

      // Check if user exists
      console.log('👤 UserService: Checking if user exists in database', { userId: userData.id });
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (existingUser) {
        console.log('👤 UserService: User exists, updating record', { userId: userData.id });
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
          console.error('👤 UserService: Error updating user:', error);
          return null;
        }
        
        console.log('👤 UserService: User updated successfully', {
          userId: updatedUser.id,
          hasWalletAddress: !!updatedUser.wallet_address,
          hasEmail: !!updatedUser.email
        });

        // Sync with Nillion
        try {
          console.log('👤 UserService: Syncing updated user with Nillion');
          await this.nillionService.storeUserData({
            id: updatedUser.id,
            walletAddress: updatedUser.wallet_address,
            email: updatedUser.email,
            metadata: updatedUser.metadata
          });
          console.log('👤 UserService: Nillion sync successful');
        } catch (nillionError) {
          console.error('👤 UserService: Error syncing user with Nillion (non-blocking):', nillionError);
          // Continue even if Nillion sync fails
        }
        
        return updatedUser;
      } else {
        console.log('👤 UserService: User does not exist, creating new user', { userId: userData.id });
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
          console.error('👤 UserService: Error creating user:', error);
          return null;
        }
        
        console.log('👤 UserService: New user created successfully', {
          userId: newUser.id,
          hasWalletAddress: !!newUser.wallet_address,
          hasEmail: !!newUser.email
        });

        // Sync with Nillion
        try {
          console.log('👤 UserService: Syncing new user with Nillion');
          await this.nillionService.storeUserData({
            id: newUser.id,
            walletAddress: newUser.wallet_address,
            email: newUser.email,
            metadata: newUser.metadata
          });
          console.log('👤 UserService: Nillion sync successful for new user');
        } catch (nillionError) {
          console.error('👤 UserService: Error syncing new user with Nillion (non-blocking):', nillionError);
          // Continue even if Nillion sync fails
        }
        
        return newUser;
      }
    } catch (error) {
      console.error('👤 UserService: Error in syncUser:', error);
      return null;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('👤 UserService: Getting user by ID', { userId });
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('👤 UserService: Error getting user by ID:', error);
        return null;
      }
      
      console.log('👤 UserService: User retrieved successfully', { 
        userId, 
        found: !!user,
        hasWalletAddress: user ? !!user.wallet_address : false,
        hasEmail: user ? !!user.email : false
      });
      
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
