import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, CheckCircle, XCircle, Users } from 'lucide-react';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white">StreamManage</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-white hover:text-gray-200 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Gérez tous vos abonnements streaming en un seul endroit
            </h1>
            <p className="mt-6 text-lg text-blue-100">
              Connectez-vous à vos plateformes préférées, suivez vos abonnements, 
              résiliez facilement et économisez de l'argent.
            </p>

            <div className="mt-8 flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  Accéder au tableau de bord
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  Commencer gratuitement
                  <span>→</span>
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Connexion sécurisée</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Gestion simplifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Économies garanties</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Netflix', color: 'bg-red-600' },
                { name: 'Disney+', color: 'bg-blue-600' },
                { name: 'Prime Video', color: 'bg-blue-800' },
                { name: 'HBO Max', color: 'bg-purple-600' },
                { name: 'Canal+', color: 'bg-yellow-600' },
                { name: 'Salto', color: 'bg-purple-800' },
              ].map((platform, index) => (
                <div
                  key={platform.name}
                  className={`${platform.color} rounded-xl p-4 flex items-center justify-center text-white font-bold shadow-lg`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {platform.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Tv className="w-8 h-8" />,
                title: 'Connexion à toutes les plateformes',
                description: 'Connectez-vous à Netflix, Disney+, Prime Video, HBO Max, Canal+, et bien plus encore.',
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: 'Gestion centralisée',
                description: 'Voir tous vos abonnements en un coup d\'œil et gérez-les facilement.',
              },
              {
                icon: <XCircle className="w-8 h-8" />,
                title: 'Résiliation en un clic',
                description: 'Résiliez vos abonnements directement depuis notre plateforme.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Partage familial',
                description: 'Gérez les abonnements pour toute la famille avec des profils séparés.',
              },
            ].map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à simplifier la gestion de vos abonnements ?
          </h2>
          <p className="text-gray-400 mb-8">
            Rejoignez des milliers d'utilisateurs satisfaits
          </p>
          
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              Accéder au tableau de bord
              <span>→</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              Commencer gratuitement
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
