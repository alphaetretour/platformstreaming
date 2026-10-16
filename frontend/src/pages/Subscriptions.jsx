import { useState, useEffect } from 'react';
import api from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Filter, Search } from 'lucide-react';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/subscriptions');
        setSubscriptions(response.data.subscriptions || []);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError('Failed to load subscriptions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscriptionUpdate = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (err) {
      console.error('Failed to refresh subscriptions:', err);
    }
  };

  const handleSubscriptionDelete = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const statuses = [
    { id: 'all', name: 'Tous' },
    { id: 'ACTIVE', name: 'Actifs' },
    { id: 'CANCELLED', name: 'Résiliés' },
    { id: 'EXPIRED', name: 'Expirés' },
    { id: 'PENDING', name: 'En attente' },
    { id: 'SUSPENDED', name: 'Suspendus' },
  ];

  const months = [
    { id: 'all', name: 'Tous les mois' },
    { id: '0', name: 'Janvier' },
    { id: '1', name: 'Février' },
    { id: '2', name: 'Mars' },
    { id: '3', name: 'Avril' },
    { id: '4', name: 'Mai' },
    { id: '5', name: 'Juin' },
    { id: '6', name: 'Juillet' },
    { id: '7', name: 'Août' },
    { id: '8', name: 'Septembre' },
    { id: '9', name: 'Octobre' },
    { id: '10', name: 'Novembre' },
    { id: '11', name: 'Décembre' },
  ];

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    // Filter by search
    const platformName = subscription.platform?.displayName?.toLowerCase() || '';
    const matchesSearch = platformName.includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus = selectedStatus === 'all' || subscription.status === selectedStatus;

    // Filter by month (based on startDate)
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const startDate = new Date(subscription.startDate);
      matchesMonth = startDate.getMonth().toString() === selectedMonth;
    }

    return matchesSearch && matchesStatus && matchesMonth;
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Abonnements</h1>
        <p className="text-gray-500 mt-1">
          Gérez tous vos abonnements en un seul endroit.
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une plateforme..."
              value={searchQuery}
              onChange={handleSearch}
              className="input pl-12"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input pl-12 appearance-none"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input pl-12 appearance-none"
            >
              {months.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">
            {subscriptions.filter(s => s.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Résiliés</p>
          <p className="text-2xl font-bold text-red-600">
            {subscriptions.filter(s => s.status === 'CANCELLED').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Dépenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(subscriptions.reduce((sum, s) => sum + (s.price || 0), 0))}
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Aucun abonnement trouvé</h3>
            <p className="text-gray-500">
              Essayez de modifier vos filtres ou ajoutez un nouvel abonnement.
            </p>
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onUpdate={handleSubscriptionUpdate}
              onDelete={handleSubscriptionDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Subscriptions;
