import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MoreVertical, 
  Trash2, 
  RefreshCw, 
  XCircle,
  CheckCircle,
  Calendar,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

function SubscriptionCard({ subscription, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return 'border-green-500 bg-green-50';
      case 'CANCELLED':
        return 'border-red-500 bg-red-50';
      case 'EXPIRED':
        return 'border-gray-500 bg-gray-50';
      case 'PENDING':
        return 'border-yellow-500 bg-yellow-50';
      case 'SUSPENDED':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'EXPIRED':
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
      case 'PENDING':
        return <RefreshCw className="w-5 h-5 text-yellow-600" />;
      case 'SUSPENDED':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return 'Actif';
      case 'CANCELLED':
        return 'Résilié';
      case 'EXPIRED':
        return 'Expiré';
      case 'PENDING':
        return 'En attente';
      case 'SUSPENDED':
        return 'Suspendu';
      default:
        return subscription.status;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = () => {
    if (!subscription.price) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: subscription.currency || 'EUR',
    }).format(subscription.price);
  };

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir résilier cet abonnement ?')) return;

    try {
      setIsLoading(true);
      await api.post(`/subscriptions/${subscription.id}/cancel`);
      onUpdate();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const handleResume = async () => {
    try {
      setIsLoading(true);
      await api.post(`/subscriptions/${subscription.id}/resume`);
      onUpdate();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible.')) return;

    try {
      setIsLoading(true);
      await api.delete(`/subscriptions/${subscription.id}`);
      onDelete(subscription.id);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const canResume = ['CANCELLED', 'SUSPENDED'].includes(subscription.status);
  const canCancel = subscription.status === 'ACTIVE';

  return (
    <div className={`subscription-card ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Platform Logo */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            {subscription.platform?.logoUrl ? (
              <img 
                src={subscription.platform.logoUrl} 
                alt={subscription.platform.displayName}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <span className="text-gray-600 font-bold">
                {subscription.platform?.displayName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Subscription Info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {subscription.platform?.displayName || 'Plateforme inconnue'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon()}
              <span className={`text-sm ${subscription.status === 'ACTIVE' ? 'text-green-600' : subscription.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-fade-in">
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Résilier
                  </button>
                )}
                
                {canResume && (
                  <button
                    onClick={handleResume}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Reprendre
                  </button>
                )}

                <button
                  onClick={() => navigate(`/connect/${subscription.platformId}`)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Synchroniser
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Depuis le {formatDate(subscription.startDate)}</span>
          </div>
          
          {subscription.endDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Jusqu'au {formatDate(subscription.endDate)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span>{formatPrice()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              subscription.autoRenew 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {subscription.autoRenew ? 'Renouvellement automatique' : 'Renouvellement manuel'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-xl">
          <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}

export default SubscriptionCard;
