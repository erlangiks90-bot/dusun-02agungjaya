const Tesseract = require('tesseract.js');

function cleanLine(s) {
  return (s || '').replace(/\s+/g, ' ').replace(/[|]/g, '').trim();
}

function normalizeDate(text) {
  if (!text) return '';
  const m = text.match(/(\d{1,2})[-\/.\s](\d{1,2})[-\/.\s](\d{4})/);
  if (!m) return '';
  const d = String(m[1]).padStart(2, '0');
  const mo = String(m[2]).padStart(2, '0');
  return `${m[3]}-${mo}-${d}`;
}

function parseKKText(rawText) {
  const lines = rawText.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const joined = lines.join('\n');

  let no_kk = '';
  const kkMatch = joined.match(/(?:NO\.?\s*KK|NOMOR\s*KK|KARTU\s*KELUARGA)?\s*[:\-]?\s*(\d{16})/i);
  if (kkMatch) no_kk = kkMatch[1];

  let alamat = '';
  const alamatLine = lines.find(l => /^ALAMAT/i.test(l));
  if (alamatLine) alamat = alamatLine.replace(/^ALAMAT\s*[:\-]?\s*/i, '');

  let rt = '';
  const rtMatch = joined.match(/RT\s*[:\/]?\s*(\d{1,3})/i);
  if (rtMatch) rt = rtMatch[1].padStart(2, '0');

  const anggota = [];
  const nikRegex = /(\d{16})/g;
  let match;
  const nikPositions = [];
  while ((match = nikRegex.exec(joined)) !== null) {
    const nik = match[1];
    if (nik !== no_kk) nikPositions.push({ nik, index: match.index });
  }

  for (const item of nikPositions) {
    const before = joined.slice(Math.max(0, item.index - 120), item.index);
    const after = joined.slice(item.index, Math.min(joined.length, item.index + 220));
    const nearby = (before + ' ' + after).replace(/\n/g, ' ');

    let nama = '';
    const wordsBefore = before.split(/\s+/).filter(Boolean);
    const candidate = wordsBefore.slice(-5).join(' ');
    if (candidate && !/\d/.test(candidate)) nama = candidate;

    const jk = /LAKI/i.test(nearby) ? 'Laki-laki' : /PEREMPUAN/i.test(nearby) ? 'Perempuan' : '';
    const tanggal_lahir = normalizeDate(nearby);

    anggota.push({
      nik: item.nik,
      nama,
      jenis_kelamin: jk,
      tempat_lahir: '',
      tanggal_lahir,
      agama: '',
      pendidikan: '',
      pekerjaan: '',
      status_perkawinan: '',
      hubungan_keluarga: '',
      kewarganegaraan: 'WNI'
    });
  }

  return {
    no_kk,
    kepala_keluarga: anggota[0]?.nama || '',
    alamat,
    rt,
    anggota,
    raw_text: rawText
  };
}

async function scanKK(imagePath) {
  const result = await Tesseract.recognize(imagePath, 'ind+eng', {
    logger: () => {}
  });
  return parseKKText(result.data.text || '');
}

module.exports = { scanKK, parseKKText };
