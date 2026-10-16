import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Link, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

function ConnectPlatform() {
  const { platformId } = useParams();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState(null);
  const [credential, setCredential] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch platform
        const platformResponse = await api.get(`/platforms/${platformId}`);
        setPlatform(platformResponse.data.platform);

        // Fetch existing credential and subscription
        const credsResponse = await api.get('/credentials');
        const cred = credsResponse.data.credentials.find(c => c.platformId === platformId);
        setCredential(cred);

        const subsResponse = await api.get('/subscriptions');
        const sub = subsResponse.data.subscriptions.find(s => s.platformId === platformId);
        setSubscription(sub);

        // Pre-fill form with existing data
        if (cred) {
          setUsername(cred.username || '');
        }
        if (sub) {
          setPrice(sub.price || '');
          setCurrency(sub.currency || 'EUR');
          setAutoRenew(sub.autoRenew !== undefined ? sub.autoRenew : true);
        }

      } catch (err) {
        console.error('Failed to fetch platform data:', err);
        setError('Failed to load platform data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [platformId]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      // Connect with credentials
      await api.post('/credentials/connect', {
        platformId: platform.id,
        username,
        password,
        metadata: {
          price: parseFloat(price) || 0,
          currency,
          autoRenew,
        },
      });

      // Create or update subscription
      if (!subscription) {
        await api.post('/subscriptions', {
          platformId: platform.id,
          price: parseFloat(price) || 0,
          currency,
          autoRenew,
        });
      } else {
        await api.put(`/subscriptions/${subscription.id}`, {
          price: parseFloat(price) || 0,
          currency,
          autoRenew,
        });
      }

      setSuccess(true);
      
      // Refresh data
      const credsResponse = await api.get('/credentials');
      const cred = credsResponse.data.credentials.find(c => c.platformId === platformId);
      setCredential(cred);

      const subsResponse = await api.get('/subscriptions');
      const sub = subsResponse.data.subscriptions.find(s => s.platformId === platformId);
      setSubscription(sub);

    } catch (err) {
      const message = err.response?.data?.error || 
        err.message || 
        'Une erreur est survenue lors de la connexion.';
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!credential) return;

    try {
      setIsLoading(true);
      await api.post(`/credentials/${credential.id}/disconnect`);
      
      // Refresh data
      const credsResponse = await api.get('/credentials');
      const cred = credsResponse.data.credentials.find(c => c.platformId === platformId);
      setCredential(cred);

    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to disconnect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!window.confirm('Êtes-vous sûr de vouloir résilier cet abonnement ?')) return;

    try {
      await api.post(`/subscriptions/${subscription.id}/cancel`);
      
      // Refresh data
      const subsResponse = await api.get('/subscriptions');
      const sub = subsResponse.data.subscriptions.find(s => s.platformId === platformId);
      setSubscription(sub);

    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      await api.post(`/subscriptions/${subscription.id}/resume`);
      
      // Refresh data
      const subsResponse = await api.get('/subscriptions');
      const sub = subsResponse.data.subscriptions.find(s => s.platformId === platformId);
      setSubscription(sub);

    } catch (err) {
      console.error('Failed to resume subscription:', err);
      setError('Failed to resume subscription. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Plateforme non trouvée</p>
        <button onClick={() => navigate('/platforms')} className="btn btn-primary mt-4">
          Retour aux plateformes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/platforms')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {platform.displayName}
          </h1>
          <p className="text-gray-500">{platform.name}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            État de la connexion
          </h2>
          
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              credential?.isConnected 
                ? 'bg-green-100' 
                : 'bg-gray-100'
            }`}>
              {credential?.isConnected ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {credential?.isConnected ? 'Connecté' : 'Non connecté'}
              </p>
              <p className="text-sm text-gray-500">
                {credential?.lastSync 
                  ? `Dernière synchronisation: ${new Date(credential.lastSync).toLocaleDateString('fr-FR')}`
                  : 'Aucune connexion active'}
              </p>
            </div>
          </div>

          {credential?.isConnected && (
            <button
              onClick={handleDisconnect}
              className="btn btn-secondary w-full mt-4"
            >
              Se déconnecter
            </button>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            État de l'abonnement
          </h2>
          
          {subscription ? (
            <>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  subscription.status === 'ACTIVE' 
                    ? 'bg-green-100' 
                    : subscription.status === 'CANCELLED' 
                      ? 'bg-red-100' 
                      : 'bg-gray-100'
                }`}>
                  {subscription.status === 'ACTIVE' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : subscription.status === 'CANCELLED' ? (
                    <XCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {subscription.status === 'ACTIVE' ? 'Actif' : 
                     subscription.status === 'CANCELLED' ? 'Résilié' : 
                     subscription.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: subscription.currency,
                    }).format(subscription.price || 0)}
                    {subscription.autoRenew && ' - Renouvellement automatique'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {subscription.status === 'ACTIVE' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="btn btn-danger flex-1"
                  >
                    Résilier
                  </button>
                )}
                {['CANCELLED', 'SUSPENDED'].includes(subscription.status) && (
                  <button
                    onClick={handleResumeSubscription}
                    className="btn btn-success flex-1"
                  >
                    Reprendre
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Aucun abonnement actif</p>
          )}
        </div>
      </div>

      {/* Connection Form */}
      {!credential?.isConnected && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Se connecter à {platform.displayName}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                Connexion réussie !
              </p>
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Identifiant / Email
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="votre@email.com"
                  className="input"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€)
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  step="0.01"
                  min="0"
                  className="input"
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Auto Renew */}
              <div className="flex items-center">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Renouvellement automatique
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Vos identifiants sont stockés de manière sécurisée et ne sont pas partagés avec des tiers.
          </p>
        </div>
      )}

      {/* Already Connected Message */}
      {credential?.isConnected && !subscription && (
        <div className="card text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Vous êtes connecté à {platform.displayName} !
          </h3>
          <p className="text-gray-500 mb-4">
            Pour commencer à gérer votre abonnement, ajoutez les détails ci-dessus.
          </p>
        </div>
      )}
    </div>
  );
}

export default ConnectPlatform;
