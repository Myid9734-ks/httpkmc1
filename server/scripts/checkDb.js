const { initializeDatabase } = require('../database/connection');

async function checkEquipments() {
  try {
    const db = await initializeDatabase();
    const equipments = await db.all(`
      SELECT *
      FROM equipments
      ORDER BY created_at DESC
    `);
    
    console.log('\n=== 설비 목록 ===');
    equipments.forEach(equipment => {
      console.log('\n-------------------');
      Object.entries(equipment).forEach(([key, value]) => {
        if (key === 'front_image' || key === 'nameplate_image') {
          console.log(`${key}: [Base64 Image Data]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEquipments(); 