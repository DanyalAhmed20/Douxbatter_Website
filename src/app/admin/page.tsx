import { LoginForm } from '@/components/admin';

export const metadata = {
  title: 'Admin Login - DouxBatter',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
