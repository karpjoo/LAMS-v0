import { seedTestData } from './seed.js';

export default async function globalSetup() {
  await seedTestData();
}
