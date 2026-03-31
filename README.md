# GestiStart - Backend API

Serveur Node.js + Express pour la plateforme de gestion GestiStart.

## 🚀 Installation & Setup

### 1. Prérequis

- Node.js v16+
- MongoDB local ou atlas
- npm ou yarn

### 2. Installation

```bash
cd GestiStart-Backend
npm install
```

### 3. Configuration

Créer un fichier `.env` à la racine :

MONGODB_URI=mongodb://localhost:27017/gestisart
JWT_SECRET=your_secret_key_change_this
PORT=5000
NODE_ENV=development
CORS_ORIIN=<http://localhost:4200>

### 4. Lancer le serveur

**Mode développement** (avec auto-reload) :

```bash

npm run dev
```

**Mode production** :

```bash
npm start
```

Accédez à : `http://localhost:5000/api/health`

---

## 📚 Structure API

### Base URL

<http://localhost:5000/api>

### Authentification

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT :

Authorization: Bearer <-token->

## 🔐 Routes d'Authentification

### POST /auth/register

Créer un compte

**Body:**

```json
{
  "email": "user@example.com",
  "nom": "John Doe",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "Employé"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "nom": "John Doe",
    "role": "Employé"
  }
}
```

---

### POST /auth/login

Se connecter

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

---

### GET /auth/me

Récupérer le profil courant (Authentification requise)

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "nom": "John Doe",
    "role": "Employé"
  }
}
```

---

### POST /auth/logout

Se déconnecter

---

## 📋 Routes Projets

### GET /projects

Récupérer tous les projets

**Query Parameters:**

- `page` : numéro de page (default: 1)
- `limit` : nombre par page (default: 10)
- `status` : filtrer par statut
- `priorite` : filtrer par priorité
- `clientId` : filtrer par client

---

### POST /projects

Créer un projet

**Body:**

```json
{
  "titre": "Refonte Site Web",
  "description": "...",
  "clientId": "client_id",
  "budget": 50000,
  "dateDebut": "2025-01-01",
  "dateFin": "2025-03-31",
  "priorite": "Haute",
  "notes": "..."
}
```

---

### GET /projects/:id

Récupérer un projet

---

### PUT /projects/:id

Mettre à jour un projet

---

### DELETE /projects/:id

Supprimer un projet

---

### POST /projects/:id/team

Assigner une équipe

**Body:**

```json
{
  "employeeIds": ["emp1", "emp2", "emp3"]
}
```

---

### GET /projects/:id/stats

Obtenir les statistiques

---

## ✅ Routes Tâches

### GET /tasks

Récupérer toutes les tâches

**Query Parameters:**

- `page` : numéro de page
- `limit` : nombre par page
- `projectId` : filtrer par projet
- `status` : filtrer par statut
- `priorite` : filtrer par priorité
- `assigneId` : filtrer par assigné

---

### POST /tasks

Créer une tâche

**Body:**

```json
{
  "titre": "Créer la page d'accueil",
  "description": "...",
  "projectId": "project_id",
  "assigneId": "employee_id",
  "priorite": "Haute",
  "dateEcheance": "2025-01-15"
}
```

---

### PATCH /tasks/:id/status

Changer le statut (Kanban)

**Body:**

```json
{
  "status": "En cours"
}
```

**Statuts valides:** `À faire`, `En cours`, `En révision`, `Terminée`

---

### POST /tasks/:id/comments

Ajouter un commentaire

**Body:**

```json
{
  "texte": "Commentaire ici"
}
```

---

### POST /tasks/:id/assign

Assigner à un employé

**Body:**

```json
{
  "employeeId": "employee_id"
}
```

---

### GET /tasks/project/:projectId/kanban

Vue Kanban d'un projet

**Response:**

```json
{
  "success": true,
  "kanban": {
    "À faire": [...],
    "En cours": [...],
    "En révision": [...],
    "Terminée": [...]
  }
}
```

---

## 👥 Routes Clients

### GET /clients

Récupérer tous les clients

**Query Parameters:**

- `page` : numéro de page
- `limit` : nombre par page
- `status` : filtrer par statut (Actif, Inactif, Prospect)
- `search` : rechercher

---

### POST /clients

Créer un client

**Body:**

```json
{
  "nomContact": "Jean Dupont",
  "nomEntreprise": "TechCorp",
  "email": "jean@techcorp.com",
  "telephone": "+33612345678",
  "adresse": "123 Rue de Paris",
  "status": "Actif"
}
```

---

### GET /clients/:id

Récupérer un client avec ses projets

---

### GET /clients/:id/stats

Obtenir les statistiques du client

---

## 👨‍💼 Routes Employés

### GET /employees

Récupérer tous les employés

**Query Parameters:**

- `page` : numéro de page
- `limit` : nombre par page
- `status` : filtrer par statut (Actif, Inactif, Congé)
- `role` : filtrer par rôle (Admin, Manager, Employé)
- `search` : rechercher

---

### POST /employees

Créer un employé

**Body:**

```json

{
  "userId": "user_id",
  "poste": "Développeur Frontend",
  "role": "Employé",
  "salaire": 35000,
  "dateEmbauche": "2023-06-01"
}
```

---

### GET /employees/:id

Récupérer un employé avec ses tâches

---

### GET /employees/:id/tasks

Récupérer les tâches assignées

**Query Parameters:**

- `status` : filtrer par statut

---

### GET /employees/:id/stats

Obtenir les statistiques de l'employé

---

### GET /employees/:id/projects

Récupérer les projets assignés

---

## 📊 Routes Dashboard

### GET /dashboard/kpis

Obtenir les KPIs principaux

---

### GET /dashboard/urgent-tasks

Obtenir les tâches urgentes

---

### GET /dashboard/charts/tasks-priority

Graphique tâches par priorité

---

### GET /dashboard/charts/tasks-status

Graphique tâches par statut

---

### GET /dashboard/charts/activity

Graphique activité (7 derniers jours)

---

### GET /dashboard/charts/employee-workload

Charge de travail des employés

---

### GET /dashboard/top-clients

Top clients

---

### GET /dashboard/alerts/risk-projects

Projets à risque (budget)

---

### GET /dashboard/alerts/overdue-projects

Projets en retard

---

### GET /dashboard/full

Dashboard complet (tous les données)

---

## 🛠 Outils & Technologies

- **Express.js** - Framework web
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hash de passwords
- **CORS** - Configuration CORS
- **dotenv** - Variables d'environnement

---

## 📝 Erreurs Courantes

### "MongoDB connecté échoue"

- Vérifier que MongoDB est lancé : `mongod`
- Vérifier l'URL dans `.env`

### "Token expiré"

- Utiliser l'endpoint `/auth/refresh` pour renouveler

### "Email existe déjà"

- L'email doit être unique par utilisateur

---

## 📖 Collection Postman

Importer `API-Postman.json` dans Postman pour tester tous les endpoints.

---

## 🔄 Workflow d'Utilisation

1. **Register** : Créer un compte → `/auth/register`
2. **Login** : Se connecter → `/auth/login`
3. **Create Project** : Créer un projet → `POST /projects`
4. **Create Tasks** : Ajouter des tâches → `POST /tasks`
5. **Assign** : Assigner aux employés → `POST /tasks/:id/assign`
6. **Track** : Suivre via Dashboard → `GET /dashboard/kpis`

---

## 📞 Support

Pour toute question, consultez la documentation ou créez une issue.

**Auteur:** Amira Nadji
**Formation:** JobInTech
**Version:** 1.0.0

1. POST /api/auth/register → créer un compte
2. POST /api/auth/login → copier le token
3. POST /api/clients → créer un client
4. POST /api/projects → créer un projet
5. POST /api/employees → créer un employé
6. POST /api/tasks → créer une tâche
7. PATCH /api/tasks/:id/status → changer le statut
8. GET /api/dashboard/full → voir le dashboard complet
