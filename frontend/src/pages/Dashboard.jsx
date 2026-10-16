import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import SubscriptionCard from '../components/SubscriptionCard';
import PlatformCard from '../components/PlatformCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  TrendingUp, 
  CreditCard, 
  Tv, 
  AlertTriangle,
  Plus,
  Calendar
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch subscriptions
        const subsResponse = await api.get('/subscriptions');
        setSubscriptions(subsResponse.data.subscriptions || []);

        // Fetch platforms
        const platformsResponse = await api.get('/platforms');
        setPlatforms(platformsResponse.data.platforms || []);

        // Fetch credentials
        const credsResponse = await api.get('/credentials');
        setCredentials(credsResponse.data.credentials || []);

        // Fetch stats
        const statsResponse = await api.get('/subscriptions/stats');
        setStats(statsResponse.data);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscriptionUpdate = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
      
      const statsResponse = await api.get('/subscriptions/stats');
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to refresh subscriptions:', err);
    }
  };

  const handleSubscriptionDelete = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const getPlatformCredentials = (platformId) => {
    return credentials.find(cred => cred.platformId === platformId);
  };

  const getPlatformSubscription = (platformId) => {
    return subscriptions.find(sub => sub.platformId === platformId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name || 'Utilisateur'} !
        </h1>
        <p className="text-gray-500 mt-1">
          Voici un aperçu de vos abonnements streaming.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Tv}
          title="Plateformes connectées"
          value={credentials.filter(c => c.isConnected).length}
          color="blue"
        />
        <StatsCard
          icon={CreditCard}
          title="Abonnements actifs"
          value={subscriptions.filter(s => s.status === 'ACTIVE').length}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          title="Dépenses mensuelles"
          value={new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(stats?.totalSpent || 0)}
          color="purple"
        />
        <StatsCard
          icon={AlertTriangle}
          title="À renouveler"
          value={subscriptions.filter(s => s.autoRenew && s.status === 'ACTIVE').length}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/platforms"
            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une plateforme
          </Link>
          <Link
            to="/subscriptions"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Voir le calendrier
          </Link>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Vos abonnements ({subscriptions.filter(s => s.status === 'ACTIVE').length})
          </h2>
          <Link
            to="/subscriptions"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir tous
          </Link>
        </div>

        {subscriptions.filter(s => s.status === 'ACTIVE').length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tv className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aucun abonnement actif</h3>
            <p className="text-gray-500 mb-4">
              Connectez-vous à une plateforme pour commencer
            </p>
            <Link
              to="/platforms"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un abonnement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions
              .filter(s => s.status === 'ACTIVE')
              .slice(0, 3)
              .map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onUpdate={handleSubscriptionUpdate}
                  onDelete={handleSubscriptionDelete}
                />
              ))}
          </div>
        )}
      </div>

      {/* Suggested Platforms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Plateformes populaires
          </h2>
          <Link
            to="/platforms"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir toutes
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.slice(0, 6).map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              subscription={getPlatformSubscription(platform.id)}
              credential={getPlatformCredentials(platform.id)}
              onConnect={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
