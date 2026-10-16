import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Lock, Eye, EyeOff, Loader2, LogOut } from 'lucide-react';

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setIsUpdating(true);

    try {
      const response = await api.put(`/users/${user.id}`, {
        name,
        email,
      });

      updateUser(response.data.user);
      setSuccess('Profil mis à jour avec succès !');

    } catch (err) {
      const message = err.response?.data?.error || 
        err.message || 
        'Une erreur est survenue lors de la mise à jour.';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsUpdating(true);

    try {
      await api.put(`/users/${user.id}`, {
        currentPassword,
        newPassword,
      });

      setSuccess('Mot de passe mis à jour avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      const message = err.response?.data?.error || 
        err.message || 
        'Une erreur est survenue lors de la mise à jour du mot de passe.';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-500 mt-1">
          Gérez vos informations personnelles et vos paramètres de sécurité.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-2xl">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{name || 'Utilisateur'}</h2>
            <p className="text-gray-500">{email}</p>
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations personnelles
        </h2>

        {error && !success && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="input pl-12"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input pl-12"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn btn-primary flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              'Mettre à jour le profil'
            )}
          </button>
        </form>
      </div>

      {/* Update Password Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn btn-secondary flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              'Changer le mot de passe'
            )}
          </button>
        </form>
      </div>

      {/* Logout Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Déconnexion
        </h2>
        <p className="text-gray-500 mb-4">
          Vous serez déconnecté de votre compte et devrez vous reconnecter pour accéder à vos données.
        </p>
        <button
          onClick={logout}
          className="btn btn-danger flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default Profile;
