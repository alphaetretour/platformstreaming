import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link, Check, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

function PlatformCard({ platform, subscription, credential, onConnect }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getStatusColor = () => {
    if (!user) return 'bg-gray-100';
    if (credential?.isConnected) return 'bg-green-100 text-green-700';
    if (subscription) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = () => {
    if (!user) return 'Connectez-vous';
    if (credential?.isConnected) return 'Connecté';
    if (subscription) return 'Abonné';
    return 'Non connecté';
  };

  const getStatusIcon = () => {
    if (!user) return null;
    if (credential?.isConnected) return <Check className="w-4 h-4" />;
    if (subscription) return <AlertTriangle className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    onConnect(platform);
  };

  return (
    <div className="platform-card cursor-pointer group" onClick={() => navigate(`/connect/${platform.id}`)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Platform Logo */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {platform.logoUrl ? (
              <img 
                src={platform.logoUrl} 
                alt={platform.displayName}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <span className="text-gray-600 font-bold text-lg">
                {platform.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Platform Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{platform.displayName}</h3>
            <p className="text-sm text-gray-500">{platform.name}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {/* Action Button */}
      {user && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleConnect}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              credential?.isConnected
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {credential?.isConnected ? 'Gérer' : 'Se connecter'}
          </button>
          
          {subscription && (
            <span className="text-sm text-gray-500">
              {subscription.status === 'ACTIVE' ? 'Actif' : subscription.status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PlatformCard;
