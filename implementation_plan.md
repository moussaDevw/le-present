# 🗺️ Feuille de Route (Roadmap) Backend

L'authentification (AuthModule) étant maintenant terminée, voici la feuille de route logique, étape par étape, pour développer le reste de l'API de votre plateforme middleware d'assurance.

## Phase 1 : Cœur du Profil et des Actifs (Users & Vehicles)

Avant de pouvoir souscrire à une assurance, vos utilisateurs doivent pouvoir gérer leur profil et leurs véhicules.

### Étape 1.1 : Gestion des Utilisateurs (`UsersModule`)
- **Query** : `getCurrentUser` (Récupérer son profil avec infos complètes).
- **Mutation** : `updateProfile` (Mettre à jour email, etc.).
- **Admin** : `getAllUsers`, `assignRole` (Gérer les accès courtiers/transporteurs).

### Étape 1.2 : Référentiel Auto & Flottes (`VehiclesModule`)
- **Queries (Référentiels partagés)** : `getVehicleCategories`, `getVehicleGenres` (Données brutes C1-C8, usages).
- **Mutations (Propriétaires)** : `addVehicle`, `updateVehicle`, `deleteVehicle` (soft-delete).
- **Gestion B2B (Flottes)** : 
  - `createFleet`, `addVehicleToFleet`, `removeVehicleFromFleet`.
  - Calcul de l'éligibilité et remontée globale d'une flotte.

---

## Phase 2 : Le Cœur Métier (Intégration et API d'Assurance)

C’est le pivot central : connecter votre Backend aux API de compagnies partenaires (comme AAS) sans exposer leur logique complexe au Front-End.

### Étape 2.1 : Intégration Partenaires (`PartnersModule` / `AasModule`)
- **Sécurité** : Chiffrement/déchiffrement des `InsuranceCompanyCredential` (OAuth, Basic Auth).
- **Client HTTP** : Créer des services pour appeler l'API AAS (Mappages des paramètres complexes de la requêtes).
- **Synchronisation** : Endpoint ou cron job pour synchroniser le stock de QR Codes (`CompanyQrStock`) et déclencher une alerte de seuil critique.

### Étape 2.2 : Simulations & Devis (`QuotesModule`)
- **Mutation** : `requestQuote` (Créer un devis Mono ou Moto).
- **Mutation B2B** : `requestFleetQuote` (Créer un devis global via `rc.flotte.request`).
- **Logique** : Ce module interceptera l'appel du client, préparera les payloads techniques pour le module Partenaire (AAS), stockera le JSON brut de réponse, et renverra le tarif formaté au Front-End.

---

## Phase 3 : Contractualisation et Facturation

Une fois le devis accepté par l'utilisateur, on passe au processus d'achat réel et à la validité des polices.

### Étape 3.1 : La Facturation & Paiements (`BillingModule`)
- **Création du Panier** : Génération d'un `Invoice` comprenant plusieurs `InvoiceItem` (utile si c'est une flotte).
- **Intégration Mobile Money** : Connexion aux API de paiement (Wave, Orange, Free).
- **Webhooks (Critique)** : Écouteurs sécurisés (`PaymentEvent`) pour valider ou rejeter la transaction, gérant l'idempotence (`externalTransactionId`) pour éviter les doubles paiements.

### Étape 3.2 : Polices d'Assurances (`InsurancesModule`)
- **Conversion** : Une fois la facture PAIÉE, transformer le `InsuranceQuote` en contrat actif (`Insurance`).
- **Édition Documentaire** : Gérer les appels API (AAS) de génération de carte verte/brune.
- **Détails & Avenants** : Création minutieuse des `InsuranceParty` (Assuré vs Souscripteur) et l'enregistrement des `InsuranceGuarantee` choisies (ex: Code 1 à 8 d'AAS).
- **Cycle de Vie** : Endpoint pour les avenants, résiliations ou annulations (`qrcode.mono.cancel`) liés aux `InsuranceStatusLog`.

---

## 🛑 User Review Required (Validation)

> [!IMPORTANT]
> Avez-vous une préférence sur le **prochain module** à attaquer exactement ? 
> Voulez-vous que l'on suive cet ordre précis (Vehicles -> Partners -> Quotes -> Billing) ?
> 
> *Aussi, avez-vous déjà les clés/URL d'accès pour un environnement de test **AAS** ou **Mobile Money**, ou devons-nous prévoir de "mocker" (simuler) les réponses API au début de la phase 2 ?*
