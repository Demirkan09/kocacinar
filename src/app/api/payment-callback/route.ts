import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = formData.get('token') as string | null;
    const status = formData.get('status') as string | null;
    const errorMessage = formData.get('errorMessage') as string | null;

    if (status === 'success' && token) {
      return NextResponse.redirect('https://www.kocacinarciftlik.com/siparis-basarili', 303);
    } else {
      const errMsg = errorMessage || 'Ödeme işlemi tamamlanamadı.';
      return NextResponse.redirect(
        `https://www.kocacinarciftlik.com/sepet?error=${encodeURIComponent(errMsg)}`, 
        303
      );
    }
  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.redirect(
      'https://www.kocacinarciftlik.com/sepet?error=Sistem_Hatasi', 
      303
    );
  }
}