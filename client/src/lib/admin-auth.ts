/**
 * Admin Authentication with PocketBase
 */

import { pb } from './pocketbase';

export interface AdminUser {
  id: string;
  email: string;
  avatar?: string;
}

export const adminAuth = {
  /**
   * Login as admin using users collection
   */
  async login(email: string, password: string): Promise<AdminUser> {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return {
        id: authData.record.id,
        email: authData.record.email,
        avatar: authData.record.avatar,
      };
    } catch (error) {
      console.error('Admin login failed:', error);
      throw new Error('Invalid email or password');
    }
  },

  /**
   * Logout
   */
  logout() {
    pb.authStore.clear();
  },

  /**
   * Check if currently logged in as admin
   */
  isAuthenticated(): boolean {
    return pb.authStore.isValid && pb.authStore.model?.collectionName === 'users';
  },

  /**
   * Get current admin user
   */
  getCurrentAdmin(): AdminUser | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    const admin = pb.authStore.model;
    return {
      id: admin?.id || '',
      email: admin?.email || '',
      avatar: admin?.avatar,
    };
  },

  /**
   * Refresh auth token
   */
  async refresh(): Promise<void> {
    try {
      await pb.collection('users').authRefresh();
    } catch (error) {
      console.error('Auth refresh failed:', error);
      this.logout();
    }
  }
};
