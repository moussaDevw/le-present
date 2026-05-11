# Sécurité GraphQL & NestJS - Guide de Production

Ce document récapitule les configurations de sécurité appliquées et recommandées pour le déploiement en production de l'API **Assurance Présent**.

## 1. Introspection du Schéma
L'introspection permet aux outils tiers (comme Apollo Sandbox) de récupérer la structure complète de votre API (requêtes, mutations, types).

- **Développement** : Activé pour faciliter le développement.
- **Production** : **Désactivé**. Cela empêche un attaquant de mapper facilement toutes vos données et vulnérabilités potentielles.
- **Impact** : L'erreur "GraphQL operations must contain a non-empty query" est normale si vous essayez d'accéder à l'URL sans passer de requête valide.

## 2. Interface GraphQL (Playground / Sandbox)
C'est l'interface interactive disponible dans le navigateur.

- **Développement** : Activé pour tester les requêtes.
- **Production** : **Désactivé**. Une API de production ne doit pas exposer d'interface de test publique. Les clients (Mobile/Web) doivent envoyer des requêtes programmatiques.

## 3. Prévention CSRF (Cross-Site Request Forgery)
Apollo Server 4+ inclut une protection contre les attaques CSRF en exigeant des en-têtes spécifiques sur les requêtes non-GET.

- **Configuration** : `csrfPrevention: true`.
- **Fonctionnement** : Bloque les requêtes provenant de formulaires HTML classiques ou de sites malveillants qui tentent d'exécuter des actions au nom de l'utilisateur.

## 4. Sécurité des En-têtes HTTP (Helmet)
L'utilisation de **Helmet** permet de configurer automatiquement plusieurs en-têtes de sécurité :
- `X-Frame-Options` : Empêche le clickjacking.
- `X-Content-Type-Options` : Empêche le sniffing de type MIME.
- `Content-Security-Policy` (CSP) : Restreint les sources de contenu autorisées.

## 5. Limitation de Profondeur (Depth Limit)
Les attaquants peuvent envoyer des requêtes récursives très profondes pour saturer le CPU et la RAM (DoS).
**Solution** : Installer `graphql-depth-limit` pour rejeter les requêtes dépassant 7 à 10 niveaux.

## 6. CORS (Cross-Origin Resource Sharing)
En production, vous ne devez jamais utiliser `origin: '*'`.
- **Recommandation** : Spécifiez uniquement le domaine de votre application frontend (ex: `https://app.assurancepresent.com`).

---

## Plan d'implémentation suggéré

### Modifications dans `src/app.module.ts`
```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  csrfPrevention: true,
}),
```

### Modifications dans `main.ts`
```typescript
app.use(helmet());
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:4200',
  credentials: true,
});
```
