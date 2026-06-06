declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        username: string;
        email: string;
        role: 'SUPERADMIN' | 'EDITOR' | 'AUTHOR';
      };
    }
    interface PageData {
      title?: string;
      description?: string;
    }
  }
}

export {};
