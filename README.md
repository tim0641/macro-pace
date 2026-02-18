# Nutrition Sport - Application Full-Stack

Application de suivi nutritionnel et d'entraînement avec synchronisation des macros et des séances de sport.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Authentification**: JWT (access + refresh tokens)
- **Base de données**: PostgreSQL (via Docker Compose)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Docker et Docker Compose

### 1. Configuration de l'environnement

Copiez le fichier `.env.example` à la racine et dans `backend/` :

```bash
cp .env.example .env
cp .env.example backend/.env
```

Modifiez les variables d'environnement si nécessaire (notamment les secrets JWT en production).

### 2. Démarrer PostgreSQL

```bash
docker compose up -d
```

Vérifiez que le conteneur est bien démarré :
```bash
docker compose ps
```

### 3. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# Seed la base de données (optionnel)
npm run prisma:seed

# Démarrer en mode développement
npm run start:dev
```

Le backend sera accessible sur `http://localhost:3001`
La documentation Swagger sera disponible sur `http://localhost:3001/api`

### 4. Frontend

Dans un nouveau terminal :

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 📋 Comptes de test

Après le seed, vous pouvez vous connecter avec :
- Email: `test@example.com`
- Mot de passe: `password123`

## 🔌 API REST

### Authentification

#### POST /auth/register
Créer un compte utilisateur

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### POST /auth/login
Se connecter

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Réponse :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/refresh
Rafraîchir le token d'accès

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Utilisateurs

#### GET /me
Obtenir le profil de l'utilisateur connecté

```bash
curl http://localhost:3001/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Aliments

#### GET /foods
Rechercher des aliments

```bash
curl "http://localhost:3001/foods?query=poulet&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### POST /foods
Créer un aliment personnalisé

```bash
curl -X POST http://localhost:3001/foods \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Poulet grillé",
    "brand": "Marque X",
    "kcal100g": 165,
    "protein100g": 31,
    "carbs100g": 0,
    "fat100g": 3.6
  }'
```

### Repas

#### POST /meals
Créer un repas

```bash
curl -X POST http://localhost:3001/meals \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eatenAt": "2024-01-15T12:30:00Z",
    "mealType": "lunch",
    "note": "Repas après entraînement"
  }'
```

#### POST /meals/:id/items
Ajouter un aliment à un repas

```bash
curl -X POST http://localhost:3001/meals/MEAL_ID/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodId": "FOOD_ID",
    "grams": 150
  }'
```

#### GET /meals
Obtenir les repas d'une date

```bash
curl "http://localhost:3001/meals?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Réponse :
```json
{
  "meals": [
    {
      "id": "...",
      "eatenAt": "2024-01-15T12:30:00Z",
      "mealType": "lunch",
      "items": [
        {
          "id": "...",
          "foodId": "...",
          "grams": 150,
          "kcal": 247.5,
          "protein": 46.5,
          "carbs": 0,
          "fat": 5.4,
          "food": { ... }
        }
      ]
    }
  ],
  "totals": {
    "kcal": 247.5,
    "protein": 46.5,
    "carbs": 0,
    "fat": 5.4
  }
}
```

### Entraînements

#### POST /workouts
Créer un entraînement

**Course (run)** :
```bash
curl -X POST http://localhost:3001/workouts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startedAt": "2024-01-15T08:00:00Z",
    "type": "run",
    "durationMin": 45,
    "distanceKm": 5.5,
    "avgPaceSecKm": 300,
    "rpe": 7,
    "notes": "Entraînement matinal"
  }'
```

**Musculation (strength)** :
```bash
curl -X POST http://localhost:3001/workouts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startedAt": "2024-01-15T18:00:00Z",
    "type": "strength",
    "durationMin": 60,
    "rpe": 8,
    "notes": "Séance jambes"
  }'
```

#### GET /workouts
Obtenir les entraînements dans une période

```bash
curl "http://localhost:3001/workouts?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Statistiques

#### GET /stats/day
Obtenir les statistiques d'une journée

```bash
curl "http://localhost:3001/stats/day?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Réponse :
```json
{
  "date": "2024-01-15",
  "nutrition": {
    "kcal": 2475,
    "protein": 150,
    "carbs": 280,
    "fat": 65
  },
  "workouts": {
    "count": 2,
    "totalDurationMin": 105,
    "totalBurnKcal": 550
  }
}
```

## 🗄️ Base de données

### Schéma Prisma

Le schéma Prisma définit les modèles suivants :
- `User` : Utilisateurs
- `Profile` : Profils utilisateurs (poids, etc.)
- `Food` : Aliments avec valeurs nutritionnelles pour 100g
- `Meal` : Repas
- `MealItem` : Items de repas avec snapshot des macros calculés
- `Workout` : Entraînements
- `RunDetails` : Détails spécifiques aux courses

### Commandes Prisma utiles

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate

# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio

# Seed la base de données
npm run prisma:seed
```

## 🔐 Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les tokens JWT sont signés avec des secrets séparés
- Les routes protégées nécessitent un token JWT valide
- Validation des données avec class-validator
- CORS configuré pour le frontend local

## 📝 Calculs

### Macros des repas
Les macros sont calculés au moment de l'ajout d'un item :
- `value = (grams / 100) * value_100g`
- Les valeurs sont snapshotées dans `MealItem` pour préserver l'historique

### Calories brûlées (estimations)
- **Course** : `kcal = 1.0 * weightKg * distanceKm`
- **Musculation** : `kcal = 6 * weightKg * (durationMin / 60)`
- Si le poids n'est pas défini dans le profil, utilisation de 70kg par défaut

## 🛠️ Développement

### Structure du projet

```
macro-pace/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/     # Module d'authentification
│   │   ├── foods/    # Module aliments
│   │   ├── meals/    # Module repas
│   │   ├── workouts/ # Module entraînements
│   │   ├── stats/    # Module statistiques
│   │   └── users/    # Module utilisateurs
│   └── prisma/       # Schéma et migrations Prisma
├── frontend/         # Application Next.js
│   └── src/
│       ├── app/      # Pages (App Router)
│       ├── components/ # Composants React
│       └── lib/      # Utilitaires et client API
└── docker-compose.yml
```

### Scripts disponibles

**Backend** :
- `npm run start:dev` : Démarrage en mode développement
- `npm run build` : Build de production
- `npm run prisma:migrate` : Exécuter les migrations
- `npm run prisma:seed` : Seed la base de données

**Frontend** :
- `npm run dev` : Démarrage en mode développement
- `npm run build` : Build de production
- `npm run start` : Démarrage en mode production

## 📚 Documentation API

Une documentation Swagger interactive est disponible à `http://localhost:3001/api` une fois le backend démarré.

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que PostgreSQL est bien démarré : `docker compose ps`
- Vérifiez que les migrations sont appliquées : `npm run prisma:migrate`
- Vérifiez les variables d'environnement dans `backend/.env`

### Erreurs CORS
- Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend
- Par défaut, le backend accepte les requêtes depuis `http://localhost:3000`

### Erreurs de connexion à la base de données
- Vérifiez que Docker Compose est bien démarré
- Vérifiez que `DATABASE_URL` dans `.env` correspond aux paramètres du conteneur PostgreSQL

## 📄 Licence

MIT
