import { sampleCompanies } from '../utils/seedCompanies.js';

console.log('Number of companies:', sampleCompanies.length);
console.log('First company:', JSON.stringify(sampleCompanies[0], null, 2));

// Check for companies without names
const companiesWithoutNames = sampleCompanies.filter(c => !c.name);
console.log('Companies without names:', companiesWithoutNames.length);

// Check for companies without slugs
const companiesWithoutSlugs = sampleCompanies.filter(c => !c.slug);
console.log('Companies without slugs:', companiesWithoutSlugs.length);
if (companiesWithoutSlugs.length > 0) {
  console.log('First company without slug:', companiesWithoutSlugs[0].name);
}