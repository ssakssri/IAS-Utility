import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">IAS Admin</h1>
          <p className="text-sm text-gray-500 mt-1">SAP IAS 계정 관리 포털</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
