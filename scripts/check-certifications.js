/**
 * Check certifications data structure
 */

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';

async function checkCertifications() {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/certifications/records`);
    const data = await response.json();
    
    console.log('📊 Certifications Data:\n');
    console.log('Total records:', data.totalItems);
    console.log('\nFirst record structure:');
    if (data.items && data.items[0]) {
      console.log(JSON.stringify(data.items[0], null, 2));
    } else {
      console.log('No records found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCertifications();
