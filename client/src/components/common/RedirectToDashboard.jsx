import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RedirectToDashboard = ({ feature }) => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success(`${feature} is now integrated into the Dashboard!`, {
      duration: 3000,
      icon: '📊'
    });
    navigate('/dashboard', { replace: true });
  }, [navigate, feature]);

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-black mx-auto mb-4"></div>
        <p className="text-nb-black/55">Redirecting to Dashboard...</p>
        <p className="text-sm text-nb-black/45 mt-2">{feature} is now integrated into the main dashboard</p>
      </div>
    </div>
  );
};

export default RedirectToDashboard;