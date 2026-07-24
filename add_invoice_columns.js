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
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS same_as_shipping BOOLEAN DEFAULT TRUE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_number TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_office TEXT;
    `);
    console.log("MİGRASYON BAŞARILI: Fatura ve Kurumsal Fatura kolonları 'orders' tablosuna başarıyla eklendi.");
  } catch (err) {
    console.error("MİGRASYON HATASI: Veritabanı bağlantısı kurulamadı veya kolon eklenemedi.");
    console.error(err.message);
    console.log("\nLütfen veritabanınızda manuel olarak şu SQL komutunu çalıştırın:");
    console.log(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS same_as_shipping BOOLEAN DEFAULT TRUE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_number TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_office TEXT;
    `);
  } finally {
    await pool.end();
  }
}

main();
