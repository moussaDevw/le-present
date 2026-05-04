# Analyse du Backend `assurance-present-back`

Après avoir parcouru le code source de votre backend, voici une synthèse de son architecture, de ses technologies et de ses principales logiques métiers.

## 1. Stack Technologique
* **Framework principal** : [NestJS](https://nestjs.com/) (Node.js) - structuré de manière modulaire (`app.module.ts`).
* **API** : GraphQL avec Apollo Server (First code approach). Le schéma (`schema.gql`) est auto-généré à partir des décorateurs TypeScript.
* **Base de données & ORM** : PostgreSQL, manipulé via [Prisma](https://www.prisma.io/).
* **Authentification** : JWT (JSON Web Tokens) couplé à un système de code OTP.

## 2. Architecture des Modules

L'application est divisée en plusieurs modules fonctionnels très distincts :

### 🔐 Authentification & Utilisateurs (`auth`, `users`)
* **Mécanisme** : Connexion par numéro de téléphone (OTP). Un code de vérification est généré, haché avec bcrypt/argon2 (sécurité renforcée) et stocké temporairement dans la table `OtpCode`.
* **Sessions** : Utilisation d'access tokens (JWT) et de refresh tokens (révocables individuellement) pour maintenir la session des utilisateurs.

### 🚗 Gestion des Véhicules (`vehicles`)
* Gère les véhicules des utilisateurs ainsi qu'un référentiel de catégories (VP, Moto C5, Bus école, Remorque, Garage C6, etc.) et de genres.
* Les véhicules ont des champs spécifiques obligatoires selon leur catégorie (ex: cylindrée pour les motos, usage commercial/non-commercial).

### 📝 Devis / Tarification (`quotes`)
* **Logique métier** : Ce module interagit avec un partenaire externe, l'**API AAS**.
* Selon la catégorie du véhicule (C5, C6, Bus, etc.), le système appelle des terminaux différents de l'API AAS (`getRcMoto`, `getRcBusEcole`, `getRcMono`) pour obtenir une simulation de prix.
* Les devis (`InsuranceQuote`) sont sauvegardés en base avec leur date d'expiration, leur prix (extrait de la réponse de l'API), et les données brutes (Request/Response) pour un audit complet.

### 🛡️ Souscriptions & Polices d'Assurance (`subscriptions`)
* Permet de transformer un **Devis** en **Police d'assurance active**.
* **Workflow** :
  1. Vérification du devis de l'utilisateur.
  2. Construction d'un payload complexe avec les informations du souscripteur, de l'assuré et du véhicule.
  3. Appel effectif à l'API AAS (`generateAttestationMoto`, `generateAttestationMono`...) pour émettre l'attestation réelle.
  4. Récupération du numéro de police, de l'URL de l'attestation et de la carte brune.
  5. **Transaction Prisma** : Sauvegarde atomique de la police d'assurance (`Insurance`) ET création d'une facture (`Invoice`) associée.

### 💳 Paiements & Facturation (`payments`)
* Gestion des transactions financières avec prise en charge des fournisseurs de paiement locaux (Wave, Orange, Free).
* Création de factures liées aux polices d'assurance et écoute des webhooks externes pour enregistrer les logs d'événements (`PaymentEvent`) et modifier le statut de la facture de manière fiable.

## 3. Modèle de Données (Prisma)
Le schéma de base de données est très complet et bien pensé pour l'extensibilité :
* **Compagnies & Credentials** : Séparation sécurisée des identifiants API des partenaires (gestion Multi-Partenaires).
* **Stocks QR** : Un mécanisme de gestion des stocks de QR codes d'attestation virtuels (synchronisé avec l'API stock.qr de AAS).
* **Flottes (`Fleet`)** : Possibilité de regrouper plusieurs véhicules et polices d'assurance sous une même entité de flotte.
* **Audit Trail** : Historisation immuable des changements de statut (`InsuranceStatusLog`) et des annulations (`InsuranceCancellation`).

## 4. Observations et Bonnes Pratiques
* **Clean Architecture** : Le code métier est bien isolé dans les services (`QuotesService`, `SubscriptionsService`), ce qui facilite la maintenance.
* **Robustesse** : La gestion des appels externes est encapsulée (`AasApiService`), et les enregistrements critiques (comme la validation d'une souscription et l'émission d'une facture) se font à l'intérieur de transactions SQL (Prisma `$transaction`) pour éviter toute désynchronisation en cas d'erreur de la base de données.
* **Sécurité** : Les mots de passe/OTP ne sont jamais stockés en clair.

## Conclusion
Le backend est une passerelle complète (BFF/API) entre vos clients mobiles/web et les APIs des compagnies d'assurance (actuellement AAS). Il gère brillamment le cycle de vie complet d'une police d'assurance : OTP -> Ajout Véhicule -> Simulation Devis (AAS) -> Paiement Mobile -> Souscription et Émission d'Attestation (AAS).
