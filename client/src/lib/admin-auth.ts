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
   * Login as admin
   */
  async login(email: string, password: string): Promise<AdminUser> {
    try {
      const authData = await pb.admins.authWithPassword(email, password);
      return {
        id: authData.admin.id,
        email: authData.admin.email,
        avatar: authData.admin.avatar,
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
    return pb.authStore.isValid && pb.authStore.model?.collectionName === undefined;
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
      await pb.collection('_admins').authRefresh();
    } catch (error) {
      console.error('Auth refresh failed:', error);
      this.logout();
    }
  }
};
