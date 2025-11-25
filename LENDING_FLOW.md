YIFY Lending Platform Flow Documentation

Overview
YIFY is a Web3 lending protocol that allows users to borrow against productive NFTs (veNFTs and NFT RWA) with automatic repayment through yield generation.

Key Parameters

LTV Calculation
LTV = MIN(50%, Projection_Yield × 65)

Maksimal LTV: 50% dari nilai jaminan
Waktu Pelunasan: 65 minggu (1 tahun 3 bulan)
Projection_Yield: Yield yang diharapkan per minggu

Yield Distribution
75% untuk pelunasan pinjaman (borrower)
20% untuk lender (dalam USDC)
5% untuk protokol

Flow Peminjam (Borrower)

1. Koneksi Wallet & Pilih Network
- Pilih network:
  - Optimism untuk veVELO
  - Base untuk veAERO
  - Ethereum untuk NFT RWA
- Koneksikan wallet (Metamask, dll)

2. Pilih Tipe Collateral

veNFT (veAERO/veVELO)
- Tampilkan:
  - Harga token saat ini
  - Projected yield (30% APR)
  - LTV (maks 50%)

NFT RWA
- Tampilkan:
  - Floor price
  - Projected yield (sesuai aset)
  - LTV (maks 50%)

3. Hitung & Ajukan Pinjaman
- Hitung LTV otomatis menggunakan rumus di atas
- Tampilkan:
  - Maksimal pinjaman berdasarkan LTV
  - Estimasi waktu pelunasan (65 minggu)
  - Simulasi alokasi yield (75% untuk pelunasan)

4. Konfirmasi & Cairkan Dana
- Tinjau detail pinjaman
- Bayar gas fee untuk approve + transaksi
- Dana langsung masuk ke wallet dalam USDC

5. Pembayaran Otomatis
- 75% yield otomatis dialokasikan untuk pelunasan
- Borrower bisa melunasi lebih cepat tanpa penalti

6. Selesai
- Setelah lunas, NFT bisa ditarik kembali
- Jika belum lunas dalam 65 minggu, pinjaman diperpanjang otomatis

Flow Pemberi Pinjaman (Lender)

1. Deposit USDC
- Setujui smart contract (1x approve)
- USDC masuk ke pool lending

2. Terima & Kelola Yield
- Dapatkan 20% dari yield yang dihasilkan (dalam USDC)
- Notifikasi real-time saat yield masuk
- Opsi auto-reinvest yield

3. Tarik Dana
- Tarik USDC kapan saja (jika likuiditas tersedia)
- Tidak ada lock period atau fee penarikan

Fitur Tambahan

Simulasi Pinjaman
- Input: Jumlah pinjaman
- Output:
  - Estimasi waktu pelunasan
  - Alokasi yield (75% untuk pelunasan)
  - Total yield yang dihasilkan

Dashboard

Borrower
- Riwayat pinjaman
- Progress pelunasan
- Sisa hutang
- Estimasi waktu pelunasan

Lender
- Total deposit USDC
- Imbal hasil yang diterima
- Riwayat transaksi
- Status auto-reinvest

Notifikasi

Borrower:
- Pembayaran berhasil
- Pinjaman lunas
- Update progress pelunasan

Lender:
- Yield USDC masuk
- Dana berhasil ditarik
- Status investasi

Parameter Penting

Umum
- Maksimal LTV: 50% untuk semua collateral
- Waktu Pelunasan: 65 minggu (1 tahun 3 bulan)
- Tidak Ada Bunga: Tidak ada bunga atau denda pelunasan lebih cepat

Bagi Hasil
- 75% untuk pelunasan pinjaman
- 20% untuk lender (dalam USDC)
- 5% untuk protokol

Network
- veVELO: Optimism
- veAERO: Base
- NFT RWA: Ethereum

Contoh Perhitungan

veAERO
- Harga AERO: $0.6862
- Projection Yield (30% APR): 0.5769% per minggu
- Total Yield 65 Minggu: 37.5%
- LTV: MIN(50%, 37.5%) = 37.5%

NFT RWA
- Floor Price NFT: $10,000
- Projection Yield (15% APR): 0.2885% per minggu
- Total Yield 65 Minggu: 18.75%
- LTV: MIN(50%, 18.75%) = 18.75%

Keuntungan untuk Semua Pihak

Borrower
- Dapat pinjaman dengan menyerahkan NFT
- Pelunasan otomatis tanpa bunga
- Bisa melunasi lebih cepat tanpa penalti

Lender
- Imbal hasil 20% APR dalam USDC
- Risiko rendah dengan LTV maksimal 50%
- Dana dapat ditarik kapan saja

Protokol
- Fee 5% dari yield
- Tidak perlu khawatir dengan likuidasi
- Model bisnis berkelanjutan

Catatan Penting
- Tidak ada mekanisme liquidasi
- Pinjaman diperpanjang otomatis jika belum lunas
- Semua transaksi transparan di blockchain
- User control penuh atas aset mereka
- Hanya menggunakan USDC untuk transaksi pinjaman
- Tidak ada verifikasi dokumen untuk NFT RWA