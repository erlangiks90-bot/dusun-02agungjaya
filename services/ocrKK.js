const Tesseract = require('tesseract.js');

function cleanLine(s) {
  return (s || '')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\d+\s+/, '')
    .trim();
}

function normalizeDate(text) {
  if (!text) return '';
  const m = text.match(/(\d{1,2})[-\/.\s](\d{1,2})[-\/.\s](\d{4})/);
  if (!m) return '';
  const d = String(m[1]).padStart(2, '0');
  const mo = String(m[2]).padStart(2, '0');
  return `${m[3]}-${mo}-${d}`;
}

function parseGender(s){
  if(/LAKI|L\b/i.test(s)) return 'Laki-laki';
  if(/PEREMPUAN| P /i.test(' '+s+' ')) return 'Perempuan';
  return '';
}

function parseKKText(rawText) {
  const lines = rawText.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const joined = lines.join('\n');

  let no_kk = '';
  const kkMatches = [...joined.matchAll(/\b(\d{16})\b/g)].map(m=>m[1]);
  if (kkMatches.length) no_kk = kkMatches[0];

  let alamat = '';
  const alamatLine = lines.find(l => /^ALAMAT/i.test(l));
  if (alamatLine) alamat = alamatLine.replace(/^ALAMAT\s*[:\-]?\s*/i, '');

  let rt = '';
  const rtMatch = joined.match(/RT\s*[:\/\s]?\s*(\d{1,3})/i);
  if (rtMatch) rt = rtMatch[1].padStart(2, '0');

  const anggota = [];
  for (let i=1; i<kkMatches.length; i++){
    const nik = kkMatches[i];
    const idx = joined.indexOf(nik);
    const around = joined.slice(Math.max(0,idx-160), Math.min(joined.length,idx+260)).replace(/\n/g,' ');
    const before = joined.slice(Math.max(0,idx-120), idx).replace(/\n/g,' ');
    let nama = before
      .replace(/\b(NO|NIK|NAMA|JENIS|KELAMIN|TEMPAT|LAHIR|AGAMA|PENDIDIKAN|PEKERJAAN)\b/ig,' ')
      .replace(/\d+/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .split(' ')
      .slice(-4)
      .join(' ');
    if(nama.length < 3) nama = '';

    const tanggal_lahir = normalizeDate(around);
    anggota.push({
      nik,
      nama,
      jenis_kelamin: parseGender(around),
      tempat_lahir: '',
      tanggal_lahir,
      agama: '',
      pendidikan: '',
      pekerjaan: '',
      status_perkawinan: '',
      hubungan_keluarga: i===1 ? 'Kepala Keluarga' : '',
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
