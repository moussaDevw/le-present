import 'dotenv/config';
import { PrismaClient, RoleName } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- 🌱 Début du Seeding AAS V.1.0 ---');

  // 1. RÔLES
  console.log('1. Création des rôles...');
  for (const roleName of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  if (!adminRole) throw new Error("Role ADMIN introuvable");

  // 2. UTILISATEUR ADMIN
  console.log('2. Création de l admin...');
  const adminUser = await prisma.user.upsert({
    where: { phone: '763497981' },
    update: { firstName: 'Moussa', lastName: 'Admin' },
    create: {
      phone: '763497981',
      firstName: 'Moussa',
      lastName: 'Admin',
      isActive: true,
    },
  });

  console.log('3. Assignation du rôle admin...');
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  // 4. RÉFÉRENTIEL VÉHICULES
  console.log('4. Insertion des catégories...');
  const categories = [
    { code: 'C1', label: 'Promenade et affaires' },
    { code: 'C2', label: 'Transport privé de marchandises (Utilitaires)' },
    { code: 'C3', label: 'Transport public de marchandises' },
    { code: 'C4', label: 'Transports de personnes à titre onéreux' },
    { code: 'C5', label: 'Deux roues / Trois roues' },
    { code: 'C6', label: 'Garage / Professionnel' },
    { code: 'C7', label: 'Auto-école' },
    { code: 'C8', label: 'Location sans chauffeur' },
    { code: 'C9', label: 'Engins Mobiles de Chantier' },
    { code: 'C10', label: 'Véhicules Spéciaux' },
    { code: 'BUS_ECOLE', label: 'Bus Scolaire' },
    { code: 'REMORQUE', label: 'Remorque' },
  ];

  for (const cat of categories) {
    console.log(`   - Catégorie ${cat.code}...`);
    await prisma.vehicleCategory.upsert({
      where: { code: cat.code },
      update: { label: cat.label },
      create: { code: cat.code, label: cat.label },
    });
  }

  console.log('5. Insertion des genres...');
  const genres = [
    { cat: 'C1', code: 'VP', label: 'Véhicule Particulier' },
    { cat: 'C2', code: 'TPC', label: 'Utilitaires carrosserie Tourisme (Break...)' },
    { cat: 'C2', code: 'TPC3T500', label: 'Utilitaires autres carrosseries <= 3.5T' },
    { cat: 'C2', code: 'TPC3T500P', label: 'Utilitaires autres carrosseries > 3.5T' },
    { cat: 'C3', code: 'TPM3T500', label: 'Transports publics marchandises <= 3.5T' },
    { cat: 'C3', code: 'TPM3T500P', label: 'Transports publics marchandises > 3.5T' },
    { cat: 'C4', code: 'TPV8', label: 'Transports de personnes onéreux (<= 8 places)' },
    { cat: 'C4', code: 'TPV9', label: 'Transports de personnes onéreux (>= 9 places)' },
    { cat: 'C5', code: '2RCYC', label: 'Cyclomoteurs', cyl: true, usage: true },
    { cat: 'C5', code: '2RSCO', label: 'Scooters / Vélomoteurs <= 125 cm3', cyl: true, usage: true },
    { cat: 'C5', code: '2RMOT', label: 'Motocyclettes / Scooters > 125 cm3', cyl: true, usage: true },
    { cat: 'C5', code: '2RSID', label: 'Side-cars (toute cylindrée)', cyl: true, usage: true },
    { cat: 'C6', code: 'C6-WG-4R', label: 'Garage Véhicule à 04 roues' },
    { cat: 'C6', code: 'C6-WG-ATELIER-AUTRE', label: 'Garage Véhicule à 02 ou 03 roues' },
    { cat: 'C7', code: 'C7-AE-SC-VTSDC_2R', label: 'Side-cars Sans Double Commande' },
    { cat: 'C7', code: 'C7-AE-VTADC', label: 'Véhicule de Tourisme Avec Double Commande' },
    { cat: 'C7', code: 'C7-AE-VTADC_TPC', label: 'Utilitaire Cat. 2-3 Avec Double Commande' },
    { cat: 'C7', code: 'C7-AE-VTSDC', label: 'Véhicule de Tourisme Sans Double Commande' },
    { cat: 'C7', code: 'C7-AE-VTSDC_TPC', label: 'Utilitaire Cat. 2-3 Sans Double Commande' },
    { cat: 'C8', code: 'C8-VLSC', label: 'Véhicule de Location Sans Chauffeur' },
    { cat: 'C8', code: 'C8-VLSC_TPC', label: 'Location Sans Chauffeur TPC' },
    { cat: 'C8', code: 'C8-VLSC_TPM3T500', label: 'Location Sans Chauffeur TPM < 3.5T' },
    { cat: 'C8', code: 'C8-VLSC_TPM3T500P', label: 'Location Sans Chauffeur TPM > 3.5T' },
    { cat: 'C9', code: 'C9-EMC-EXCLUSION', label: 'Engins Mobiles de Chantier (Exclusions)' },
    { cat: 'C9', code: 'C9-EMC-EXTENSION', label: 'Engins Mobiles de Chantier (Extensions)' },
    { cat: 'C10', code: 'C10-VS-EMC', label: 'Tracteurs forestiers (EMC)' },
    { cat: 'C10', code: 'C10-VS-EMC_TPC3T500', label: 'Tracteurs forestiers < 3.5T' },
    { cat: 'C10', code: 'C10-VS-EMC_TPC3T500P', label: 'Tracteurs forestiers > 3.5T' },
    { cat: 'C10', code: 'C10-VS-TAR', label: 'Tracteurs agricoles et routiers' },
    { cat: 'C10', code: 'C10-VS-TAR_TPC3T500', label: 'Tracteurs AGR < 3.5T' },
    { cat: 'C10', code: 'C10-VS-TAR_TPC3T500P', label: 'Tracteurs AGR > 3.5T' },
    { cat: 'C10', code: 'C10-VS-VACFF', label: 'Ambulances / Corbillards / Fourgons' },
    { cat: 'C10', code: 'C10-VS-VAME', label: 'Véhicules à moteur électrique' },
    { cat: 'C10', code: 'C10-VS-VCP', label: 'Véhicules des collectivités publiques' },
    { cat: 'C10', code: 'C10-VS-VCP_TPC3T500', label: 'Collectivités publiques < 3.5T' },
    { cat: 'C10', code: 'C10-VS-VCP_TPC3T500P', label: 'Collectivités publiques > 3.5T' },
    { cat: 'BUS_ECOLE', code: 'BE-VTA', label: 'Transport dans autocars (Scolaire)' },
    { cat: 'BUS_ECOLE', code: 'BE-VTCATP', label: 'Transport dans camions aménagés (Scolaire)' },
    { cat: 'REMORQUE', code: 'REMORQUE', label: 'Remorque' },
  ];

  for (const g of genres) {
    console.log(`   - Genre ${g.code}...`);
    const cat = await prisma.vehicleCategory.findUnique({ where: { code: g.cat } });
    if (!cat) throw new Error(`Catégorie ${g.cat} introuvable pour le genre ${g.code}`);

    await prisma.vehicleGenre.upsert({
      where: { code: g.code },
      update: {
        label: g.label,
        categoryId: cat.id,
        requiresCylinder: g.cyl || false,
        requiresUsage: g.usage || false,
      },
      create: {
        code: g.code,
        label: g.label,
        categoryId: cat.id,
        requiresCylinder: g.cyl || false,
        requiresUsage: g.usage || false,
      },
    });
  }

  // 6. RÉFÉRENTIEL GARANTIES
  console.log('6. Insertion des garanties AAS...');
  const guarantees = [
    { code: '1', label: 'Défense et recours' },
    { code: '2', label: 'Personnes transportées' },
    { code: '3', label: 'Bris de glace' },
    { code: '4', label: 'Avance / Recours' },
    { code: '5', label: 'Incendie' },
    { code: '6', label: 'Vol' },
    { catCode: '7', code: '7', label: 'Tierce collision' }, // catCode non utilisé en DB mais utile pour tri
    { code: '8', label: 'Tierce complète' },
  ];

  for (const g of guarantees) {
    console.log(`   - Garantie ${g.code} : ${g.label}...`);
    await prisma.guarantee.upsert({
      where: { code: g.code },
      update: { label: g.label },
      create: { code: g.code, label: g.label },
    });
  }

  // 7. COMPAGNIES D'ASSURANCE
  console.log('7. Insertion des compagnies d assurance...');
  const companies = [
    { name: 'AAS (La Secu)', code: 'AAS', apiBaseUrl: 'https://kiiraytest.lasecu-assurances.sn/api/v1' },
    { name: 'NSIA', code: 'NSIA', apiBaseUrl: null },
    { name: 'ALLIANZ', code: 'ALLIANZ', apiBaseUrl: null },
  ];

  for (const comp of companies) {
    console.log(`   - Compagnie ${comp.code}...`);
    await prisma.insuranceCompany.upsert({
      where: { code: comp.code },
      update: { name: comp.name, apiBaseUrl: comp.apiBaseUrl },
      create: { name: comp.name, code: comp.code, apiBaseUrl: comp.apiBaseUrl },
    });
  }

  console.log('--- ✅ Seeding terminé avec succès ---');
}

main()
  .catch((e) => {
    console.error('❌ ERREUR DURANT LE SEEDING :');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
