# Fromagerie — interface web

Interface React, TypeScript et Vite de l'application Fromagerie. Le backend se
trouve dans le dossier voisin `fromagerie-back`.

## Démarrage local

Prérequis : Node.js et npm compatibles avec les versions déclarées dans
`package.json`, ainsi qu'un backend démarré sur `localhost:8080`.

Depuis ce dossier :

```bash
npm ci
npm run dev
```

Ouvrir `http://localhost:5173`. En développement, Vite transmet les requêtes
`/api` au backend sur `http://localhost:8080`. Aucune URL d'API supplémentaire
n'est donc nécessaire pour ce mode de lancement. Pour appeler une autre URL,
définir `VITE_API_BASE_URL` dans un fichier local non suivi, par exemple
`.env.local`, et adapter les origines CORS autorisées côté backend si les
requêtes passent par un autre site.

Le guide de préparation de PostgreSQL, des variables d'environnement et du
profil `dev` se trouve dans [le README du backend](../fromagerie-back/README.md).

## Vérifications

```bash
npm test
npm run lint
npm run build
```

La commande `npm run build` vérifie également les types TypeScript.
