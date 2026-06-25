const Tesseract = require('tesseract.js');

function cleanLine(s) {
  return (s || '').replace(/[|_[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
}
function normalizeDate(text) {
  const m = (text || '').match(/(\d{1,2})[-\/.\s](\d{1,2})[-\/.\s](\d{4})/);
  if (!m) return '';
  return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
}
function parseGender(s) {
  const t = ' ' + (s || '').toUpperCase() + ' ';
  if (t.includes('LAKI')) return 'Laki-laki';
  if (t.includes('PEREMPUAN')) return 'Perempuan';
  return '';
}
function parseKKText(rawText) {
  const lines = rawText.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const joined = lines.join('\n');
  const nums = [...new Set([...joined.matchAll(/\b(\d{16})\b/g)].map(m => m[1]))];

  const no_kk = nums[0] || '';
  const alamatLine = lines.find(x => /^ALAMAT/i.test(x));
  const alamat = alamatLine ? alamatLine.replace(/^ALAMAT\s*[:.\-]?\s*/i, '') : '';
  const rtMatch = joined.match(/\bRT\s*[:.\-/ ]?\s*(\d{1,3})\b/i);
  const rt = rtMatch ? rtMatch[1].padStart(2, '0') : '';

  const anggota = [];
  for (let i = 1; i < nums.length; i++) {
    const nik = nums[i];
    const idx = joined.indexOf(nik);
    const before = joined.slice(Math.max(0, idx - 130), idx).replace(/\n/g, ' ');
    const around = joined.slice(Math.max(0, idx - 100), Math.min(joined.length, idx + 260)).replace(/\n/g, ' ');
    let nama = before
      .replace(/\b(NO|NIK|NAMA|JENIS|KELAMIN|TEMPAT|LAHIR|AGAMA|PENDIDIKAN|PEKERJAAN|STATUS|HUBUNGAN|KELUARGA)\b/ig, ' ')
      .replace(/\d+/g, ' ')
      .replace(/[^A-Za-z .']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => w.length > 1)
      .slice(-4)
      .join(' ');

    anggota.push({
      nik,
      nama,
      jenis_kelamin: parseGender(around),
      tempat_lahir: '',
      tanggal_lahir: normalizeDate(around),
      agama: '',
      pendidikan: '',
      pekerjaan: '',
      status_perkawinan: '',
      hubungan_keluarga: i === 1 ? 'Kepala Keluarga' : ''
    });
  }

  return {
    no_kk,
    kepala_keluarga: anggota[0]?.nama || '',
    alamat,
    rt,
    anggota,
    raw_text: rawText,
    confidence_note: 'OCR hanya bantuan. Wajib koreksi manual sebelum simpan.'
  };
}
async function scanKK(imagePath) {
  const result = await Tesseract.recognize(imagePath, 'ind+eng', { logger: () => {} });
  const parsed = parseKKText(result.data.text || '');
  parsed.confidence = Math.round(result.data.confidence || 0);
  return parsed;
}
module.exports = { scanKK, parseKKText };
