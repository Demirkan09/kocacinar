const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL=(.+)/);
const databaseUrl = match ? match[1].trim().replace(/#.*$/, '').trim() : '';

const pool = new Pool({
  connectionString: databaseUrl
});

async function main() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
    console.log("MİGRASYON BAŞARILI: 'is_active' kolonu 'products' tablosuna başarıyla eklendi.");
  } catch (err) {
    console.error("MİGRASYON HATASI: Veritabanı bağlantısı kurulamadı veya kolon eklenemedi.");
    console.error(err.message);
    console.log("\nLütfen veritabanınızda manuel olarak şu SQL komutunu çalıştırın:");
    console.log("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;");
  } finally {
    await pool.end();
  }
}

main();
