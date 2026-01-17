'use client';

import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">DouxBatter Admin</h1>
          <p className="text-gray-600 mt-2">Enter your password to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
