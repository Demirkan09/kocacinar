// Telefon Maskeleme Yardımcısı (Türkiye için +90 (5XX) XXX XX XX)

export function formatPhoneNumber(value: string): string {
  if (!value) return '';

  // Sadece rakamları al
  let digits = value.replace(/\D/g, '');

  // Başta 0 varsa kaldır (0534... -> 534...)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Maksimum 10 hane
  digits = digits.slice(0, 10);

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}

export function getRawPhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}
