# StreamManage - Plateforme de Gestion d'Abonnements Streaming

Une application complète pour gérer, résilier et s'abonner à des plateformes de streaming en se connectant avec ses identifiants.

## 🚀 Fonctionnalités

### Gestion des Abonnements
- ✅ Connexion à toutes les plateformes de streaming populaires (Netflix, Disney+, Prime Video, HBO Max, etc.)
- ✅ Visualisation de tous vos abonnements en un seul endroit
- ✅ Résiliation en un clic
- ✅ Reprise des abonnements suspendus ou résiliés
- ✅ Suivi des dépenses mensuelles
- ✅ Rappels de renouvellement automatique

### Tableau de Bord
- ✅ Vue d'ensemble des abonnements actifs
- ✅ Statistiques de consommation
- ✅ Historique des connexions
- ✅ Alertes pour les abonnements à renouveler

### Sécurité
- ✅ Authentification JWT sécurisée
- ✅ Stockage chiffré des identifiants
- ✅ Protection contre les attaques CSRF et XSS
- ✅ Limitation des requêtes (Rate Limiting)

## 📁 Structure du Projet

```
platformstreaming/
├── backend/                  # API Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/           # Configuration (DB, JWT)
│   │   ├── controllers/      # Logique métier
│   │   ├── middleware/       # Middleware (Auth, Errors)
│   │   ├── models/           # Modèles de données
│   │   ├── routes/           # Routes API
│   │   └── server.js         # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma     # Schéma de la base de données
│   └── package.json
│
├── frontend/                 # Application Frontend (React)
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── context/          # Contexte (Auth)
│   │   ├── pages/            # Pages de l'application
│   │   ├── services/         # Services API
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── styles/           # Styles
│   │   ├── App.jsx           # Application principale
│   │   └── main.jsx          # Point d'entrée
│   └── package.json
│
├── docker-compose.yml        # Configuration Docker
└── README.md
```

## 🛠 Prérequis

- Node.js 18+ 
- PostgreSQL 15+
- npm ou yarn
- Docker (optionnel)

## 📥 Installation

### Méthode 1: Installation Locale

1. **Cloner le dépôt**
```bash
git clone https://github.com/alphaetretour/platformstreaming.git
cd platformstreaming
```

2. **Configurer le Backend**
```bash
cd backend
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer la base de données
npx prisma migrate dev --name init
npx prisma generate
```

3. **Configurer le Frontend**
```bash
cd ../frontend
npm install
```

4. **Démarrer les serveurs**

Ouvrir deux terminaux :

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

5. **Accéder à l'application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Méthode 2: Avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter les services
docker-compose down
```

L'application sera accessible à:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🔧 Configuration

### Variables d'Environnement (Backend)

Créer un fichier `.env` dans le dossier `backend/` :

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/platformstreaming?schema=public"

# JWT Secret (changer en production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Variables d'Environnement (Frontend)

Le frontend utilise les variables par défaut pour se connecter au backend local.

## 🌍 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir l'utilisateur actuel
- `POST /api/auth/refresh` - Rafraîchir le token

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Obtenir un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Plateformes
- `GET /api/platforms` - Liste des plateformes
- `GET /api/platforms/:id` - Obtenir une plateforme
- `POST /api/platforms` - Créer une plateforme (Admin)
- `PUT /api/platforms/:id` - Mettre à jour une plateforme (Admin)
- `DELETE /api/platforms/:id` - Supprimer une plateforme (Admin)
- `GET /api/platforms/:id/connection-status` - État de la connexion

### Abonnements
- `GET /api/subscriptions` - Liste des abonnements de l'utilisateur
- `GET /api/subscriptions/:id` - Obtenir un abonnement
- `POST /api/subscriptions` - Créer un abonnement
- `PUT /api/subscriptions/:id` - Mettre à jour un abonnement
- `POST /api/subscriptions/:id/cancel` - Résilier un abonnement
- `POST /api/subscriptions/:id/resume` - Reprendre un abonnement
- `DELETE /api/subscriptions/:id` - Supprimer un abonnement
- `GET /api/subscriptions/stats` - Statistiques des abonnements

### Identifiants
- `GET /api/credentials` - Liste des identifiants de l'utilisateur
- `GET /api/credentials/:id` - Obtenir un identifiant
- `POST /api/credentials/connect` - Se connecter à une plateforme
- `POST /api/credentials/:id/disconnect` - Se déconnecter
- `POST /api/credentials/:id/test` - Tester la connexion
- `DELETE /api/credentials/:id` - Supprimer un identifiant

## 📊 Modèle de Données

### User
```typescript
{
  id: string
  email: string
  password: string
  name?: string
  createdAt: DateTime
  updatedAt: DateTime
  subscriptions: Subscription[]
  credentials: PlatformCredential[]
}
```

### Platform
```typescript
{
  id: string
  name: string
  displayName: string
  logoUrl?: string
  baseUrl?: string
  apiEndpoint?: string
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Subscription
```typescript
{
  id: string
  user: User
  platform: Platform
  status: SubscriptionStatus (ACTIVE, CANCELLED, EXPIRED, PENDING, SUSPENDED)
  startDate: DateTime
  endDate?: DateTime
  renewalDate?: DateTime
  price?: number
  currency?: string
  autoRenew: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PlatformCredential
```typescript
{
  id: string
  user: User
  platform: Platform
  username?: string
  password?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: DateTime
  isConnected: boolean
  lastSync?: DateTime
  metadata?: Json
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🎯 Utilisation

### Compte de Démonstration

Pour tester rapidement l'application, utilisez ces identifiants :

- **Email**: demo@streammanage.com
- **Mot de passe**: password123

### Connexion à une Plateforme

1. Allez dans "Plateformes"
2. Sélectionnez une plateforme
3. Cliquez sur "Se connecter"
4. Entrez vos identifiants
5. Validez la connexion

### Gestion des Abonnements

1. Allez dans "Abonnements"
2. Visualisez tous vos abonnements
3. Utilisez le menu pour résilier, reprendre ou supprimer

## 🔒 Sécurité

- Tous les mots de passe sont hachés avec bcrypt
- Les tokens JWT sont utilisés pour l'authentification
- Les identifiants des plateformes sont stockés de manière sécurisée
- Protection contre les attaques CSRF
- Limitation des requêtes API

## 🚀 Déploiement

### Déploiement en Production

1. **Configurer les variables d'environnement**
   - Changer `JWT_SECRET` avec une clé sécurisée
   - Configurer la base de données PostgreSQL
   - Définir `NODE_ENV=production`

2. **Build le Frontend**
```bash
cd frontend
npm run build
```

3. **Build le Backend**
```bash
cd backend
npm run build
```

4. **Démarrer les services**
   - Utiliser PM2, Docker ou un service comme Heroku

### Exemple avec PM2

```bash
# Backend
cd backend
pm2 start server.js --name platformstreaming-backend

# Frontend (nécessite un serveur statique)
cd frontend
pm2 serve dist 5173 --spa
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forker le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalité`)
3. Commiter vos modifications (`git commit -m 'Ajout de la nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalité`)
5. Ouvrir une Pull Request

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter.

---

**StreamManage** - La solution ultime pour gérer vos abonnements streaming.

*Fait avec ❤️ et Node.js/React* 🚀
