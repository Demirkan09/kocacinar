import { query } from '@/lib/db';

const DEFAULT_BOT_TOKEN = '8894565366:AAFXhC9zG8Y_XHm0q_tdlf69hDlStiTqlFk';

export async function getTelegramBotToken(): Promise<string> {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    return process.env.TELEGRAM_BOT_TOKEN.trim();
  }
  try {
    const res = await query("SELECT value FROM site_settings WHERE key = 'telegram_bot_token'");
    if (res.rows[0]?.value) {
      return res.rows[0].value.trim();
    }
  } catch (e) {
    console.warn('site_settings telegram_bot_token okunamadı:', e);
  }
  return DEFAULT_BOT_TOKEN;
}

export async function getTelegramChatId(): Promise<string | null> {
  if (process.env.TELEGRAM_CHAT_ID) {
    return process.env.TELEGRAM_CHAT_ID.trim();
  }
  try {
    const res = await query("SELECT value FROM site_settings WHERE key = 'telegram_chat_id'");
    if (res.rows[0]?.value && res.rows[0].value.trim() !== '') {
      return res.rows[0].value.trim();
    }
  } catch (e) {
    console.warn('site_settings telegram_chat_id okunamadı:', e);
  }

  // Eğer kaydedilmiş Chat ID yoksa Telegram getUpdates API'sinden son mesaj atan sohbeti otomatik tespit et
  try {
    const token = await getTelegramBotToken();
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { cache: 'no-store' });
    const data = await response.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      // En son güncellemeyi al
      const lastUpdate = data.result[data.result.length - 1];
      const chatId = lastUpdate.message?.chat?.id || lastUpdate.channel_post?.chat?.id || lastUpdate.my_chat_member?.chat?.id;
      if (chatId) {
        console.log('Telegram Otomatik Chat ID Tespit Edildi:', chatId);
        // Otomatik bulunan Chat ID'yi ayarlar tablosuna kaydet
        try {
          await query(
            "INSERT INTO site_settings (key, value) VALUES ('telegram_chat_id', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [chatId.toString()]
          );
        } catch {}
        return chatId.toString();
      }
    }
  } catch (err) {
    console.error('Telegram Chat ID otomatik tespiti başarısız:', err);
  }

  return null;
}

export async function sendTelegramMessage(text: string, customChatId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getTelegramBotToken();
    const chatId = customChatId || (await getTelegramChatId());

    if (!chatId) {
      console.warn('Telegram Mesajı Gönderilemedi: Chat ID bulunamadı. Lütfen t.me/kocacinarsiparis_bot botuna bir mesaj atıp /start deyin veya paneldem Chat ID girin.');
      return { success: false, error: 'Chat ID bulunamadı. Lütfen Telegram botuna mesaj atın.' };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      console.error('Telegram API Hatası:', data);
      return { success: false, error: data.description || 'Telegram mesajı gönderilemedi' };
    }
  } catch (error: any) {
    console.error('Telegram Bildirimi Gönderme Hatası:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTelegramOrderNotification(orderNo: string): Promise<void> {
  try {
    const res = await query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    if (res.rows.length === 0) {
      console.warn(`Sipariş #${orderNo} veritabanında bulunamadı, Telegram bildirimi gönderilemiyor.`);
      return;
    }

    const order = res.rows[0];
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    let itemsListText = '';
    if (Array.isArray(items)) {
      itemsListText = items.map((item: any) => {
        const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
        return `• <b>${item.quantity} Adet</b> x ${item.name} — ₺${itemTotal}`;
      }).join('\n');
    }

    const sameAsShipping = order.same_as_shipping !== false;
    const isCorporate = order.is_corporate === true;

    let billingSection = '📄 <b>FATURA BİLGİSİ:</b>\n<i>Teslimat adresi ile aynı.</i>';
    if (!sameAsShipping && order.billing_address) {
      billingSection = `📄 <b>FATURA ADRESİ:</b>\n${order.billing_address}`;
    }
    if (isCorporate) {
      billingSection += `\n\n🏢 <b>KURUMSAL FATURA BİLGİLERİ:</b>\n• <b>Firma:</b> ${order.company_name || 'Belirtilmedi'}\n• <b>Vergi No:</b> ${order.tax_number || 'Belirtilmedi'}\n• <b>Vergi Dairesi:</b> ${order.tax_office || 'Belirtilmedi'}`;
    }

    const createdDate = order.created_at 
      ? new Date(order.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const messageHtml = `🚨 <b>YENİ SİPARİŞ VAR!</b> 🚨
━━━━━━━━━━━━━━━━━━━━
📌 <b>Sipariş Kodu:</b> <code>${order.order_no}</code>
👤 <b>Müşteri:</b> ${order.buyer_name || 'Müşteri'}
📞 <b>Telefon:</b> ${order.buyer_phone || 'Belirtilmemiş'}
📅 <b>Tarih:</b> ${createdDate}

🛒 <b>SİPARİŞ İÇERİĞİ:</b>
${itemsListText}

💰 <b>Ara Toplam:</b> ₺${Number(order.subtotal).toFixed(2)}
🚚 <b>Kargo Ücreti:</b> ${Number(order.shipping_fee) > 0 ? '₺' + Number(order.shipping_fee).toFixed(2) : 'Ücretsiz'}
💳 <b>TOPLAM TUTAR:</b> <b>₺${Number(order.total_amount).toFixed(2)}</b>

📍 <b>TESLİMAT ADRESİ:</b>
${order.shipping_address || 'Adres belirtilmemiş'}

${billingSection}
━━━━━━━━━━━━━━━━━━━━`;

    await sendTelegramMessage(messageHtml);
  } catch (err) {
    console.error('Sipariş Telegram bildirimi hazırlanırken hata:', err);
  }
}
