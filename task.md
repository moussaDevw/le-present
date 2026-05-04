# Suivi du Développement : Module d'Authentification (AuthModule)

- [x] **0. Configuration & Environnement**
  - [x] Ajouter les variables d'environnement (`JWT_*`, `TWILIO_*`)
  - [x] Installer/Vérifier les dépendances nécessaires (`twilio`, `@nestjs/jwt`, `bcryptjs`, `passport-jwt`)

- [x] **1. DTOs & Models GraphQL**
  - [x] Créer `SendOtpInput`
  - [x] Créer `VerifyOtpInput`
  - [x] Créer `RegisterUserInput`
  - [x] Créer `AuthPayload` et `VerifyOtpResponse`

- [x] **2. Services & Intégrations**
  - [x] Créer le `TwilioService` (pour l'envoi de SMS via l'API Twilio)
  - [x] Créer l'`AuthService` avec le hachage bcryptjs
  - [x] Implémenter logique : `sendOtp`, `verifyOtp`, `registerUser`, `refreshTokens`

- [x] **3. Résolveurs (GraphQL API)**
  - [x] Créer `AuthResolver`
  - [x] Exposer les 4 mutations principales

- [x] **4. Sécurité & Guards**
  - [x] Configurer le `JwtModule`
  - [x] Créer `JwtStrategy`
  - [x] Créer `GqlAuthGuard`
  - [x] Créer le décorateur `@CurrentUser()`

- [x] **5. Finalisation**
  - [x] Lier tous ces composants dans `AuthModule`
  - [x] Importer `AuthModule` dans `AppModule`
