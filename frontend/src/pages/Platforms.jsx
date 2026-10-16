import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PlatformCard from '../components/PlatformCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Plus } from 'lucide-react';

function Platforms() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [platformsResponse, subsResponse, credsResponse] = await Promise.all([
          api.get('/platforms'),
          api.get('/subscriptions'),
          api.get('/credentials'),
        ]);

        setPlatforms(platformsResponse.data.platforms || []);
        setSubscriptions(subsResponse.data.subscriptions || []);
        setCredentials(credsResponse.data.credentials || []);

      } catch (err) {
        console.error('Failed to fetch platforms:', err);
        setError('Failed to load platforms. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPlatformCredentials = (platformId) => {
    return credentials.find(cred => cred.platformId === platformId);
  };

  const getPlatformSubscription = (platformId) => {
    return subscriptions.find(sub => sub.platformId === platformId);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPlatforms = platforms.filter((platform) => {
    const matchesSearch = platform.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         platform.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'Toutes' },
    { id: 'connected', name: 'Connectées' },
    { id: 'subscribed', name: 'Abonnements' },
    { id: 'available', name: 'Disponibles' },
  ];

  const filteredByCategory = filteredPlatforms.filter((platform) => {
    const credential = getPlatformCredentials(platform.id);
    const subscription = getPlatformSubscription(platform.id);

    switch (selectedCategory) {
      case 'connected':
        return credential?.isConnected;
      case 'subscribed':
        return subscription !== undefined;
      case 'available':
        return !credential?.isConnected && !subscription;
      default:
        return true;
    }
  });

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plateformes de Streaming</h1>
        <p className="text-gray-500 mt-1">
          Parcourez et connectez-vous à vos plateformes préférées.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une plateforme..."
              value={searchQuery}
              onChange={handleSearch}
              className="input pl-12"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredByCategory.length === 0 ? (
          <div className="md:col-span-3 text-center py-12">
            <p className="text-gray-500">Aucune plateforme trouvée</p>
          </div>
        ) : (
          filteredByCategory.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              subscription={getPlatformSubscription(platform.id)}
              credential={getPlatformCredentials(platform.id)}
              onConnect={() => navigate(`/connect/${platform.id}`)}
            />
          ))
        )}
      </div>

      {/* Add Platform Button */}
      {filteredByCategory.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => navigate('/connect/new')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Ajouter une plateforme
          </button>
        </div>
      )}
    </div>
  );
}

export default Platforms;
