import type { AgreementText } from '@server/features/agreement/agreement.type';

/** Project wording inspired by the supplied outline; all values come from the approved credit. */
export function agreementSections(data: AgreementText) {
  return [
    {
      heading: `Nomor ${data.number}`,
      paragraphs: [
        `Pada ${data.date}, ${data.bank}, beralamat di ${data.bankAddress}, diwakili oleh ${data.representative}, selanjutnya disebut Bank, dan ${data.customer}, NIK ${data.identity}, alamat ${data.address}, karyawan ${data.company}, selanjutnya disebut Debitor, menyepakati ketentuan berikut.`,
      ],
    },
    {
      heading: 'Pasal 1 - Fasilitas dan jangka waktu',
      paragraphs: [
        `Bank menyetujui fasilitas kredit sebesar Rp${data.principal} (${data.principalWords}) untuk ${data.months} bulan. Angsuran pertama jatuh pada ${data.firstPayment} dan akhir tenor pada ${data.maturity}. Rekening tujuan yang dikonfirmasi Debitor: ${data.account}.`,
      ],
    },
    {
      heading: 'Pasal 2 - Bunga dan biaya',
      paragraphs: [
        `Perhitungan kredit menggunakan bunga flat ${data.monthlyRate}% per bulan. Angsuran bulanan sebesar Rp${data.installment}. Rincian biaya mengikuti snapshot persetujuan yang tercantum pada surat persetujuan kredit.`,
      ],
    },
    {
      heading: 'Pasal 3 - Pembayaran dan keterlambatan',
      paragraphs: [
        `Debitor memenuhi pembayaran sesuai jadwal melalui mekanisme pembayaran yang disepakati dengan Bank dan perusahaan. Denda keterlambatan sebesar ${data.lateFee}% per hari dari angsuran yang tertunda. Perhitungan pelunasan dipercepat diminta kepada Bank sebelum pembayaran dilakukan.`,
      ],
    },
    {
      heading: 'Pasal 4 - Kewajiban informasi Debitor',
      paragraphs: [
        'Debitor menyampaikan data yang benar, menggunakan fasilitas sesuai permohonan, dan memberitahukan perubahan pekerjaan, alamat, atau keadaan yang memengaruhi pembayaran. Perubahan hubungan kerja tidak menghapus kewajiban yang telah timbul.',
      ],
    },
    {
      heading: 'Pasal 5 - Pelaksanaan pembayaran',
      paragraphs: [
        'Pelaksanaan pemotongan atau pendebetan memerlukan dasar persetujuan yang berlaku pada rekening terkait. Rincian transaksi dan penyelesaian selisih pembayaran dapat diminta melalui saluran layanan Bank.',
      ],
    },
    {
      heading: 'Pasal 6 - Asuransi',
      paragraphs: [
        'Biaya asuransi jiwa kredit tercantum pada rincian persetujuan. Cakupan, pengecualian, dan tata cara klaim mengikuti polis yang diberikan oleh penyelenggara asuransi.',
      ],
    },
    {
      heading: 'Pasal 7 - Perubahan dan penyelesaian kewajiban',
      paragraphs: [
        'Perubahan ketentuan kredit harus diberitahukan dan disepakati melalui dokumen yang dapat ditelusuri. Pelunasan dan penyelesaian kewajiban mengikuti perhitungan Bank yang dapat diperiksa oleh Debitor.',
      ],
    },
    {
      heading: 'Pasal 8 - Pengaduan dan penyelesaian perselisihan',
      paragraphs: [
        'Para pihak terlebih dahulu menyelesaikan perbedaan melalui pengaduan dan musyawarah. Jika belum terselesaikan, para pihak dapat menggunakan mekanisme penyelesaian sengketa yang berlaku. Dokumen ini dibaca bersama surat persetujuan dan konfirmasi rekening.',
      ],
    },
    {
      heading: 'Pernyataan para pihak',
      paragraphs: [
        `Bank: ${data.bank} - ${data.representative}. Debitor: ${data.customer}. Tanggal konfirmasi nasabah: ${data.date}.`,
      ],
    },
    {
      heading: 'Surat persetujuan kredit',
      paragraphs: [
        `Kepada ${data.customer}. Bank menyetujui fasilitas nomor ${data.number} dengan pokok Rp${data.principal}, tenor ${data.months} bulan, bunga flat ${data.monthlyRate}% per bulan, dan angsuran Rp${data.installment}.`,
        ...data.expenses,
        `Rekening tujuan: ${data.account}. Jadwal pertama: ${data.firstPayment}; akhir tenor: ${data.maturity}.`,
        'Persetujuan dan konfirmasi ini merekam ketentuan kredit; pelaksanaan pencairan dan pembayaran dilakukan melalui proses operasional Bank.',
      ],
    },
  ];
}
