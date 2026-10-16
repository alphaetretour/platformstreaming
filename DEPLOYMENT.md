# 🚀 Déploiement sur Netlify et Render

Ce guide explique comment déployer l'application StreamManage sur **Netlify** (frontend) et **Render** (backend).

## 📋 Prérequis

- Un compte [Netlify](https://www.netlify.com/)
- Un compte [Render](https://render.com/)
- Un dépôt GitHub avec le code
- Un compte PostgreSQL (Render propose une base de données gratuite)

---

## 🎨 Déploiement du Frontend sur Netlify

### Étape 1: Préparer le frontend

Le frontend est déjà configuré pour Netlify avec le fichier `netlify.toml`.

### Étape 2: Déployer sur Netlify

1. **Connectez-vous** à [Netlify](https://app.netlify.com/)

2. **Ajoutez un nouveau site**
   - Cliquez sur **"Add new site"** > **"Import an existing project"**
   - Sélectionnez **GitHub**
   - Autorisez Netlify à accéder à votre dépôt

3. **Sélectionnez votre dépôt**
   - Choisissez `platformstreaming`
   - Sélectionnez la branche `main`

4. **Configurer les options de build**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `frontend` (si vous déployez seulement le frontend)

5. **Variables d'environnement**
   Ajoutez la variable suivante :
   ```
   Key: VITE_API_URL
   Value: https://votre-backend-render.onrender.com/api
   ```
   *(Remplacez par l'URL de votre backend Render)*

6. **Déployer**
   - Cliquez sur **"Deploy site"**
   - Attendez que le déploiement se termine

7. **Votre site est en ligne !**
   - Netlify vous donnera une URL comme `https://votre-site.netlify.app`

---

## 🏗 Déploiement du Backend sur Render

### Étape 1: Créer une base de données PostgreSQL

1. **Dans Render**, allez dans **Dashboard** > **New** > **PostgreSQL**
2. **Configurer la base de données**
   - Nom: `platformstreaming-db`
   - Plan: Free
   - Région: Sélectionnez la plus proche de vous
3. **Créer la base de données**
4. **Noter l'URL de connexion** (elle ressemble à `postgres://...`)

### Étape 2: Déployer le backend

1. **Dans Render**, allez dans **Dashboard** > **New** > **Web Service**
2. **Connecter à GitHub**
   - Sélectionnez votre dépôt `platformstreaming`
   - Sélectionnez la branche `main`

3. **Configurer le service**
   - **Name**: `platformstreaming-backend`
   - **Region**: Sélectionnez la même que votre base de données
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`

4. **Variables d'environnement**
   Ajoutez les variables suivantes :
   ```
   DATABASE_URL: postgresql://user:password@host:port/database?schema=public
   JWT_SECRET: votre-cle-secrete-jwt-aleatoire
   JWT_EXPIRES_IN: 24h
   NODE_ENV: production
   PORT: 3001
   CORS_ORIGIN: https://votre-frontend.netlify.app
   ```
   *(Remplacez par vos valeurs réelles)*

5. **Déployer**
   - Cliquez sur **"Create Web Service"**
   - Attendez que le déploiement se termine

6. **Votre backend est en ligne !**
   - Render vous donnera une URL comme `https://votre-backend.onrender.com`

---

## 🔗 Configuration Finale

### Mettre à jour le frontend avec l'URL du backend

1. **Dans Netlify**, allez dans **Site settings** > **Environment variables**
2. **Mettre à jour VITE_API_URL** avec l'URL de votre backend Render
   ```
   VITE_API_URL: https://votre-backend-render.onrender.com/api
   ```

3. **Redéployer le frontend**
   - Netlify va automatiquement redéployer

### Mettre à jour le backend avec l'URL du frontend

1. **Dans Render**, allez dans votre service backend
2. **Mettre à jour CORS_ORIGIN**
   ```
   CORS_ORIGIN: https://votre-frontend.netlify.app
   ```

3. **Redéployer le backend**
   - Render va automatiquement redéployer

---

## 📝 Configuration Alternative avec Docker

Si vous préférez utiliser Docker, vous pouvez déployer sur d'autres plateformes comme **Railway** ou **Fly.io**.

### Fichiers Docker
- `backend/Dockerfile` - Configuration pour le backend
- `frontend/Dockerfile` - Configuration pour le frontend
- `docker-compose.yml` - Configuration pour le développement local

---

## 🎯 Vérification

Une fois déployé, vérifiez que :

1. ✅ Le frontend est accessible sur Netlify
2. ✅ Le backend répond à `https://votre-backend.onrender.com/health`
3. ✅ Vous pouvez vous connecter avec le compte démo:
   - Email: `demo@streammanage.com`
   - Mot de passe: `password123`

---

## 💡 Conseils

### 1. Base de données de démonstration
Pour peupler votre base de données avec des données de test, vous pouvez exécuter le script de seed :
```bash
# Sur votre machine locale
cd backend
npx prisma db seed
```

### 2. Variables d'environnement sécurisées
- Utilisez des **clés secrètes** pour JWT_SECRET
- Ne partagez jamais vos variables d'environnement
- Utilisez des **variables d'environnement différentes** pour la production

### 3. Surveillance
- **Netlify**: Vérifiez les logs dans **Deploys** > sélectionnez un déploiement
- **Render**: Vérifiez les logs dans **Logs**

### 4. Mises à jour
Les modifications poussées sur la branche `main` seront **automatiquement déployées** par Netlify et Render.

---

## 🔒 Sécurité

### HTTPS
- Netlify et Render fournissent **HTTPS par défaut**
- Aucune configuration supplémentaire nécessaire

### CORS
- Assurez-vous que `CORS_ORIGIN` est correctement configuré
- En production, évitez d'utiliser `*` comme origine

### Base de données
- Utilisez un **mot de passe fort** pour votre base de données
- Sauvegardez régulièrement vos données

---

## 📊 Coûts

- **Netlify**: Gratuit pour les sites statiques
- **Render**: 
  - Base de données PostgreSQL: Gratuit (limite de 90 jours d'inactivité)
  - Service Web: Gratuit (avec limitations)

---

## ❓ Dépannage

### Problème: CORS Errors
**Solution**: Vérifiez que `CORS_ORIGIN` dans votre backend correspond exactement à l'URL de votre frontend (y compris `https://` et pas de `/` à la fin).

### Problème: Database Connection Failed
**Solution**: 
1. Vérifiez que `DATABASE_URL` est correct
2. Vérifiez que la base de données est accessible
3. Vérifiez que le schema `public` existe

### Problème: Prisma Migration Failed
**Solution**: 
```bash
# Sur votre machine locale
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Problème: Frontend ne se connecte pas au backend
**Solution**: 
1. Vérifiez que `VITE_API_URL` est correct
2. Vérifiez que le backend est en ligne
3. Vérifiez les logs du frontend (F12 dans le navigateur)

---

## 📞 Support

Si vous rencontrez des problèmes, consultez :
- [Documentation Netlify](https://docs.netlify.com/)
- [Documentation Render](https://render.com/docs)
- [GitHub Issues](https://github.com/alphaetretour/platformstreaming/issues)

---

**Félicitations !** Votre application StreamManage est maintenant déployée et accessible au public. 🎉
