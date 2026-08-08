import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendTelegramMessage, getTelegramBotToken, getTelegramChatId } from '@/lib/telegram';

async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload }: any = await jwtVerify(token, secret);
    const userId = payload.id || payload.userId || payload.sub;
    const res = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    if (res.rows[0]?.role !== 'admin') return null;
    return { id: userId };
  } catch { return null; }
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  try {
    const token = await getTelegramBotToken();
    const chatId = await getTelegramChatId();
    return NextResponse.json({
      botToken: token,
      botUsername: 't.me/kocacinarsiparis_bot',
      chatId: chatId || ''
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  try {
    const { action, chatId, testMessage } = await request.json();

    if (action === 'save_chat_id') {
      if (!chatId) return NextResponse.json({ error: 'Chat ID boş olamaz' }, { status: 400 });
      await query(
        "INSERT INTO site_settings (key, value) VALUES ('telegram_chat_id', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
        [chatId.toString().trim()]
      );
      return NextResponse.json({ success: true, chatId: chatId.toString().trim() });
    }

    if (action === 'send_test') {
      const targetChatId = chatId || (await getTelegramChatId());
      if (!targetChatId) {
        return NextResponse.json({
          error: 'Chat ID bulunamadı. Lütfen önce t.me/kocacinarsiparis_bot botuna Telegram üzerinden bir mesaj atıp /start deyin.'
        }, { status: 400 });
      }

      const msg = testMessage || `<b>Koca Çınar Şarküteri — Telegram Bot Testi 🤖</b>\n\nBot bildirim sistemi başarıyla bağlandı! Artık yeni siparişler anında buraya düşecektir.`;
      const res = await sendTelegramMessage(msg, targetChatId);
      if (res.success) {
        return NextResponse.json({ success: true, message: 'Test mesajı Telegram hesabınıza başarıyla iletildi! 📲' });
      } else {
        return NextResponse.json({ error: res.error || 'Mesaj gönderilemedi' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
