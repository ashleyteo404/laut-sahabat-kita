/**
 * Bahasa Indonesia. Type-checked against `en.ts`: a missing key, a stray key or a typo fails the
 * build. Placeholder names such as `{name}` are NOT checked by the compiler here — they must match
 * the English source exactly, or the literal `{name}` shows up on screen.
 *
 * Written for primary-school readers and their teachers. Proper nouns stay untranslated:
 * Laut Sahabat Kita, Ocean Passport, JARI, Gili Bidara, Gili Range, Gili Sarang, Supabase.
 */

import type { Dictionary, ServerDictionary, UiDictionary } from '@/lib/i18n/dictionaries/en'

export const idUi: UiDictionary = {
  // ── Merek (nama produk — sama di kedua bahasa) ──
  'brand.name': 'Laut Sahabat Kita',
  'brand.tagline': 'Ocean Passport',
  'brand.schoolFallback': 'LSK',

  // ── Navigasi ──
  'nav.dashboard.student': 'Perjalananku',
  'nav.dashboard.staff': 'Ringkasan',
  'nav.explore': 'Jelajah',
  'nav.passport': 'Paspor',
  'nav.badges': 'Lencana',
  'nav.journal': 'Jurnal',
  'nav.review': 'Tinjau',
  'nav.students': 'Siswa',
  'nav.sessions': 'Sesi',
  'nav.programme': 'Program',

  // ── Kerangka aplikasi ──
  'shell.title.student': 'Paspor Laut Digital',
  'shell.title.teacher': 'Ruang kerja guru',
  'shell.title.jariAdmin': 'Ruang kerja program JARI',
  'shell.nav.primary': 'Navigasi utama',
  'shell.nav.mobile': 'Navigasi ponsel',
  'shell.connectedAs': 'Masuk sebagai {role}',
  'shell.signOut': 'Keluar',
  'shell.profileLabel': '{name}, {role}',
  'shell.affiliation': '{role} · {school}',
  'shell.subtitle.student': 'Penjelajah cilik',
  'role.student': 'siswa',
  'role.teacher': 'guru',
  'role.jariAdmin': 'administrator JARI',
  'roleTitle.teacher': 'Guru',
  'roleTitle.jariAdmin': 'Administrator JARI',

  // ── Aplikasi web progresif ──
  'pwa.offlineBanner':
    'Kamu sedang luring. Pekerjaan dan foto yang sudah selesai tetap tersimpan di perangkat ini dan akan terunggah setelah kamu tersambung kembali.',
  'pwa.installApp': 'Pasang aplikasi',
  'pwa.updateApp': 'Perbarui aplikasi',
  'pwa.installHelp.ios': 'Di Safari, ketuk Bagikan, lalu Tambahkan ke Layar Utama.',
  'pwa.installHelp.manual':
    'Gunakan Pasang di bilah alamat atau menu peramban. Jika tidak tersedia, buka situs HTTPS yang sudah terpasang lalu muat ulang.',

  // ── Sinkronisasi luring ──
  'sync.uploading': 'Mengunggah pekerjaan tersimpan',
  'sync.uploadNow': 'Unggah pekerjaan tersimpan sekarang',
  'sync.syncing': 'Menyinkronkan…',
  'sync.waiting': '{count} menunggu',

  // ── Batas galat ──
  'error.title': 'Halaman ini tidak dapat dimuat.',
  'error.body': 'Periksa koneksimu lalu coba lagi.',
  'error.retry': 'Coba lagi',

  // ── Label status ──
  'status.pending': 'Menunggu',
  'status.approved': 'Disetujui',
  'status.returned': 'Dikembalikan',
  'status.earned': 'Diraih',
  'status.learning': 'Belajar',
  'status.explorer': 'Penjelajah',
  'status.locked': 'Terkunci',

  // ── Satuan ──
  'unit.hoursShort': '{value} j',

  // ── Masuk ──
  'login.eyebrow': 'Selamat datang kembali',
  'login.heading': 'Masuk ke paspormu',
  'login.intro':
    'Siswa masuk dengan nama pengguna dan PIN dari guru. Guru masuk dengan alamat email.',
  'login.identifierLabel': 'Email atau nama pengguna',
  'login.identifierPlaceholder': 'nama@sekolah.org atau siti482',
  'login.passwordLabel': 'Kata sandi atau PIN',
  'login.passwordPlaceholder': 'Kata sandi atau PIN 6 angka',
  'login.submit': 'Masuk →',
  'login.submitPending': 'Sedang masuk…',
  'login.footnote': 'Guru dan siswa menggunakan cara masuk aman yang sama.',
  'login.forgotLink': 'Guru? Lupa kata sandi',

  // ── Atur ulang kata sandi (staf) ──
  'forgot.eyebrow': 'Guru dan administrator',
  'forgot.heading': 'Atur ulang kata sandi',
  'forgot.intro':
    'Masukkan alamat email yang kamu pakai untuk masuk. Jika cocok dengan sebuah akun, kami akan mengirim tautan untuk membuat kata sandi baru.',
  'forgot.emailLabel': 'Alamat email',
  'forgot.emailPlaceholder': 'nama@sekolah.org',
  'forgot.submit': 'Kirim tautan',
  'forgot.submitPending': 'Mengirim…',
  'forgot.studentNote':
    'Siswa masuk dengan nama pengguna dan PIN. Jika lupa PIN, minta gurumu mengatur ulang.',
  'forgot.backToLogin': '← Kembali ke halaman masuk',
  'reset.eyebrow': 'Keamanan akun',
  'reset.heading': 'Buat kata sandi baru',
  'reset.intro':
    'Gunakan minimal 8 karakter. Setelah disimpan, akunmu akan keluar dari perangkat lain.',
  'reset.passwordLabel': 'Kata sandi baru',
  'reset.confirmLabel': 'Ulangi kata sandi baru',
  'reset.submit': 'Simpan kata sandi',
  'reset.submitPending': 'Menyimpan…',

  // ── Kartu aktivitas ──
  'activity.mode.field': 'Kegiatan lapangan',
  'activity.mode.online': 'Belajar daring',
  'activity.minutes': '{minutes} mnt',
  'activity.open.begin': 'Mulai',
  'activity.open.review': 'Lihat kembali',
  'activity.open.pending': 'Lihat kiriman',
  'activity.open.queued': 'Lihat unggahan tersimpan',
  'activity.open.returned': 'Coba lagi',
  'activity.submit.saving': 'Menyimpan di perangkat…',
  'activity.submit.field': 'Kirim ke guru →',
  'activity.submit.online': 'Selesaikan kegiatan →',
  'activity.returnedBy': 'Dikembalikan oleh gurumu:',
  'activity.returnedFallback': 'Tambahkan bukti yang lebih jelas atau keterangan yang lebih rinci.',
  'activity.state.needsAttention': 'Unggahan tersimpan perlu diperiksa',
  'activity.state.savedOnDevice': 'Tersimpan di perangkat ini',
  'activity.state.complete': 'Kegiatan selesai',
  'activity.state.awaitingApproval': 'Menunggu persetujuan guru',
  'activity.queued.autoUpload': 'Akan terunggah otomatis saat internet tersedia kembali.',
  'activity.queued.syncNow': 'Sinkronkan sekarang',
  'activity.queued.remove': 'Hapus',
  'activity.confirmRemove': 'Hapus kiriman tersimpan ini beserta fotonya dari perangkat ini?',
  'activity.photoLabel': 'Foto bukti',
  'activity.photoPrompt': 'Ketuk untuk menambahkan foto lapangan',
  'activity.photoHint': 'JPG, PNG, atau WebP · maksimal 3 MB',
  'activity.reflection.fieldLabel': 'Apa yang kamu perhatikan?',
  'activity.reflection.onlineLabel': 'Refleksimu',
  'activity.reflection.placeholder': 'Tulis beberapa kalimat dengan kata-katamu sendiri…',
  'activity.draftNote':
    'Draf tulisan tersimpan di perangkat ini. Saat dikirim, fotonya juga disimpan secara luring.',
  'activity.cancel': 'Batal',
  'activity.saved':
    'Tersimpan aman di perangkat ini. Akan terunggah saat internet tersedia kembali.',
  'activity.uploadedField': 'Terunggah dan terkirim ke gurumu.',
  'activity.uploadedOnline': 'Terunggah dan selesai.',
  'activity.retryUploaded': 'Pekerjaan tersimpan berhasil diunggah.',
  'activity.stillWaiting': 'Masih menunggu koneksi internet.',
  'activity.deviceSaveFailed': 'Perangkat ini tidak dapat menyimpan kiriman.',
  'activity.deviceRetryFailed': 'Perangkat ini tidak dapat mengulang unggahan tersimpan.',
  'activity.deviceRemoveFailed': 'Perangkat ini tidak dapat menghapus unggahan tersimpan.',

  // ── Kartu tinjauan ──
  'review.approve': 'Setujui',
  'review.return': 'Kembalikan untuk diperbaiki',
  'review.openEvidence': 'Buka bukti dari {name}',
  'review.viewPhoto': 'Lihat foto penuh',
  'review.noteLabel': 'Catatan tinjauan (opsional)',
  'review.notePlaceholder': 'Masukan opsional',

  // ── Formulir sesi ──
  'session.titleLabel': 'Judul sesi',
  'session.titlePlaceholder': 'Penyelidikan lapangan mangrove',
  'session.settingLabel': 'Bentuk pembelajaran',
  'session.type.field': 'Pembelajaran lapangan',
  'session.type.online': 'Pembelajaran daring',
  'session.type.classroom': 'Persiapan di kelas',
  'session.type.community': 'Kegiatan komunitas',
  'session.dateLabel': 'Tanggal',
  'session.durationLabel': 'Durasi dalam menit',
  'session.islandLabel': 'Pulau',
  'session.islandNone': 'Tidak khusus satu pulau',
  'session.habitatLabel': 'Habitat yang dikunjungi',
  'session.habitatPlaceholder': 'Mangrove, lamun, terumbu…',
  'session.studentsLabel': 'Siswa yang hadir',
  'session.grade': 'Kelas {grade}',
  'session.noStudents': 'Belum ada siswa yang terdaftar di sekolah ini.',
  'session.reflectionLabel': 'Refleksi guru',
  'session.reflectionPlaceholder': 'Apa yang berjalan baik? Apa yang perlu diubah lain kali?',
  'session.observationLabel': 'Pengamatan lapangan',
  'session.observationPlaceholder':
    'Kondisi, jenis biota, pertanyaan siswa, atau catatan keselamatan…',
  'session.save': 'Simpan sesi',
  'session.savePending': 'Menyimpan sesi…',

  // ── Akun siswa ──
  'accounts.schoolLabel': 'Sekolah',
  'accounts.schoolPlaceholder': 'Pilih sekolah',
  'accounts.schoolFixed': 'Siswa akan ditambahkan ke {school}.',
  'accounts.manualHeading': 'Masukkan data siswa',
  'accounts.manualIntro':
    'Hanya nama lengkap yang wajib. Kosongkan nama pengguna dan PIN agar dibuat otomatis.',
  'accounts.col.row': '#',
  'accounts.col.fullName': 'Nama lengkap',
  'accounts.col.grade': 'Kelas',
  'accounts.col.username': 'Nama pengguna',
  'accounts.col.pin': 'PIN',
  'accounts.autoPlaceholder': 'otomatis',
  'accounts.removeRow': 'Hapus baris {row}',
  'accounts.addRow': '+ Tambah baris',
  'accounts.rowLimit': 'Maksimal {max} siswa sekaligus.',
  'accounts.rowProblem': 'Baris {row}: {problem}',
  'accounts.submit': 'Buat akun',
  'accounts.submitPending': 'Membuat akun…',
  'accounts.csvHeading': 'Unggah berkas CSV',
  'accounts.csvIntro':
    'Unggah daftar kelas untuk mengisi tabel. Kamu bisa memeriksa dan mengubah setiap baris sebelum membuat akun.',
  'accounts.csvChoose': 'Ketuk untuk memilih berkas CSV',
  'accounts.csvLoaded': '{count} baris dimuat dari {file}. Periksa di tabel di atas.',
  'accounts.csvFormatHeading': 'Format berkas yang diperlukan',
  'accounts.csvFormatHeader':
    'Baris pertama harus berisi nama kolom di bawah ini. Urutan kolom bebas.',
  'accounts.csvFormatColumn': 'Kolom',
  'accounts.csvFormatRequired': 'Wajib',
  'accounts.csvFormatMeaning': 'Isi dengan',
  'accounts.csvFormatYes': 'Ya',
  'accounts.csvFormatNo': 'Tidak',
  'accounts.csvFormatFullName': 'Nama lengkap siswa',
  'accounts.csvFormatGrade': 'Kelas, misalnya 5',
  'accounts.csvFormatUsername':
    '3–32 karakter: huruf kecil, angka, titik, tanda hubung, atau garis bawah. Kosongkan agar dibuat otomatis.',
  'accounts.csvFormatPin':
    '6 angka, tidak semuanya sama dan tidak berurutan (bukan 123456). Kosongkan agar dibuat otomatis.',
  'accounts.csvFormatNotes':
    'Simpan sebagai CSV (UTF-8). Pemisah koma atau titik koma sama-sama bisa. Maksimal {max} siswa per berkas.',
  'accounts.csvFormatExample': 'Contoh',
  'accounts.csvTemplate': 'Unduh templat',
  'accounts.csv.empty': 'Berkas kosong.',
  'accounts.csv.missingColumn': 'Baris pertama harus memuat kolom full_name.',
  'accounts.csv.missingName': 'Baris {line}: full_name kosong.',
  'accounts.csv.tooManyRows': 'Berkas berisi lebih dari {max} siswa. Bagi menjadi beberapa berkas.',
  'accounts.csv.unclosedQuote': 'Baris {line}: tanda kutip tidak ditutup.',
  'accounts.csv.unreadable': 'Berkas tidak dapat dibaca.',
  'accounts.results.heading': 'Akun dibuat',
  'accounts.results.warning':
    'Cetak atau catat PIN ini sekarang. PIN hanya ditampilkan sekali dan tidak bisa dilihat lagi. PIN yang hilang bisa diatur ulang dari halaman Siswa.',
  'accounts.results.signInHint': 'Siswa masuk ke aplikasi dengan nama pengguna dan PIN.',
  'accounts.results.print': 'Cetak',
  'accounts.results.download': 'Unduh data masuk (CSV)',
  'accounts.results.addMore': 'Tambah siswa lagi',
  'accounts.results.failedHeading': 'Tidak dibuat',
  'accounts.results.problem': 'Masalah',
  'accounts.reset.button': 'Atur ulang PIN',
  'accounts.reset.pending': 'Mengatur ulang…',
  'accounts.reset.confirm': 'Buat PIN baru untuk {name}? PIN lama tidak akan berlaku lagi.',
  'accounts.reset.newPin': 'PIN baru',
  'accounts.reset.shownOnce': 'Hanya ditampilkan sekali. Catat sekarang.',
  'accounts.emailSignIn': 'Masuk dengan email',
  'accounts.edit.button': 'Ubah',
  'accounts.edit.save': 'Simpan perubahan',
  'accounts.edit.saving': 'Menyimpan…',
  'accounts.edit.close': 'Tutup',
  'accounts.delete.button': 'Hapus',
  'accounts.delete.pending': 'Menghapus…',
  'accounts.delete.confirm':
    'Hapus {name}? Akun dan data masuknya akan dihapus. Tindakan ini tidak dapat dibatalkan.',
  'accounts.delete.blocked': 'Siswa yang sudah memiliki pekerjaan tersimpan tidak dapat dihapus.',

  // ── Hasil proses masuk ──
  'action.login.invalidIdentifier': 'Masukkan alamat email atau nama penggunamu.',
  'action.login.invalidUsername': 'Nama pengguna tidak valid. Tanyakan kepada gurumu.',
  'action.login.invalidEmail': 'Masukkan alamat email yang valid.',
  'action.login.passwordTooShort': 'Kata sandi minimal 6 karakter.',
  'action.login.invalidCredentials': 'Data masuk tidak cocok. Periksa lalu coba lagi.',
  'action.login.emailNotConfirmed': 'Konfirmasi alamat emailmu sebelum masuk.',
  'action.login.tooManyAttempts': 'Terlalu banyak percobaan masuk. Tunggu sebentar lalu coba lagi.',
  'action.login.failed': 'Proses masuk tidak dapat diselesaikan. Coba lagi sebentar lagi.',

  // ── Hasil atur ulang kata sandi ──
  'action.forgot.sent':
    'Jika email itu milik akun guru atau administrator, tautan untuk mengatur ulang sedang dikirim. Periksa kotak masuk dan folder spam.',
  'action.forgot.invalidEmail': 'Masukkan alamat email yang valid.',
  'action.forgot.studentAccount':
    'Siswa tidak dapat mengatur ulang PIN lewat email. Minta gurumu mengatur ulang.',
  'action.forgot.tooManyRequests':
    'Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.',
  'action.forgot.failed':
    'Email tidak dapat dikirim. Coba lagi nanti atau hubungi administrator JARI.',
  'action.reset.tooShort': 'Gunakan minimal 8 karakter.',
  'action.reset.tooLong': 'Gunakan maksimal 72 karakter.',
  'action.reset.mismatch': 'Kedua kata sandi tidak sama.',
  'action.reset.samePassword': 'Pilih kata sandi yang berbeda dari yang sekarang.',
  'action.reset.weak': 'Kata sandi itu terlalu mudah ditebak. Pilih yang lebih kuat.',
  'action.reset.failed': 'Kata sandi tidak dapat disimpan. Minta tautan baru lalu coba lagi.',

  // ── Hasil tinjauan ──
  'action.review.noteRequired': 'Tambahkan catatan singkat tentang apa yang perlu siswa perbaiki.',
  'action.review.invalid': 'Periksa rincian tinjauan lalu coba lagi.',
  'action.review.failed': 'Tinjauan tidak dapat disimpan. Coba lagi sebentar lagi.',
  'action.review.approved': 'Lencana disetujui.',
  'action.review.returned': 'Kiriman dikembalikan.',

  // ── Hasil sesi pembelajaran ──
  'action.session.titleTooShort': 'Tambahkan judul sesi yang jelas.',
  'action.session.durationInvalid': 'Masukkan durasi antara 5 dan 600 menit.',
  'action.session.invalid': 'Periksa rincian sesi lalu coba lagi.',
  'action.session.migrationRequired': 'Jalankan supabase/schema.sql terbaru sebelum mencatat sesi.',
  'action.session.failed': 'Sesi tidak dapat disimpan. Coba lagi sebentar lagi.',
  'action.session.saved': 'Sesi pembelajaran tersimpan.',

  // ── Hasil kiriman (dipakai formulir di perangkat dan titik akhir unggahan) ──
  'action.submission.reflectionTooShort': 'Tulis minimal sepuluh karakter pada refleksimu.',
  'action.submission.photoRequired': 'Kegiatan lapangan membutuhkan foto.',
  'action.submission.photoTooLarge': 'Ukuran foto harus kurang dari 3 MB.',
  'action.submission.photoWrongType': 'Gunakan gambar JPG, PNG, atau WebP.',
  'action.submission.invalid': 'Periksa kiriman lalu coba lagi.',
  'action.submission.signInAgain': 'Masuk kembali untuk mengunggah kiriman tersimpan.',
  'action.submission.wrongAccount': 'Kiriman tersimpan ini milik akun siswa yang berbeda.',
  'action.submission.studentsOnly': 'Hanya akun siswa yang dapat mengirim kegiatan.',
  'action.submission.activityNotFound': 'Kegiatan tidak ditemukan.',
  'action.submission.migrationRequired':
    'Jalankan migrasi basis data sinkronisasi luring sebelum mengunggah kiriman tersimpan.',
  'action.submission.lookupFailed':
    'Kiriman tersimpan tidak dapat diperiksa. Coba lagi sebentar lagi.',
  'action.submission.alreadySent': 'Sudah terkirim ke gurumu.',
  'action.submission.alreadyUploaded': 'Sudah terunggah.',
  'action.submission.alreadySubmitted': 'Kegiatan ini sudah dikirim.',
  'action.submission.uploadFailed':
    'Foto tidak dapat diunggah. Coba lagi saat koneksimu lebih kuat.',
  'action.submission.uploaded': 'Kiriman terunggah.',
  'action.submission.saveFailed': 'Kiriman tidak dapat disimpan. Coba lagi sebentar lagi.',
  'action.submission.sentForReview': 'Terkirim ke gurumu untuk ditinjau.',
  'action.submission.completed': 'Kegiatan selesai.',

  // ── Hasil antrean luring (juga ditulis oleh service worker) ──
  'action.sync.waitingForConnection': 'Menunggu koneksi internet.',
  'action.sync.uploadFailed': 'Unggahan gagal ({status}).',
  'action.sync.storageUnavailable': 'Tidak dapat membuka penyimpanan perangkat.',

  // ── Hasil akun siswa ──
  'action.accounts.notConfigured':
    'Pembuatan akun belum disiapkan di server ini. Hubungi administrator JARI.',
  'action.accounts.notAllowed':
    'Hanya guru dan administrator JARI yang dapat mengelola akun siswa.',
  'action.accounts.noSchool': 'Akunmu belum terhubung ke sekolah. Hubungi administrator JARI.',
  'action.accounts.invalidSchool': 'Pilih sekolah.',
  'action.accounts.invalidRows':
    'Daftar siswa tidak dapat dibaca. Muat ulang halaman lalu coba lagi.',
  'action.accounts.noRows': 'Tambahkan setidaknya satu siswa.',
  'action.accounts.tooManyRows': 'Kamu bisa menambahkan maksimal {max} siswa sekaligus.',
  'action.accounts.fixRows':
    'Belum ada akun yang dibuat. Perbaiki baris yang ditandai di bawah lalu coba lagi.',
  'action.accounts.nameRequired': 'Nama lengkap wajib diisi.',
  'action.accounts.nameTooLong': 'Nama lengkap maksimal 80 karakter.',
  'action.accounts.gradeTooLong': 'Kelas maksimal 10 karakter.',
  'action.accounts.usernameInvalid':
    'Nama pengguna harus 3–32 karakter: huruf kecil, angka, titik, tanda hubung, atau garis bawah.',
  'action.accounts.usernameDuplicate': 'Nama pengguna ini dipakai lebih dari sekali dalam daftar.',
  'action.accounts.usernameTaken': 'Nama pengguna ini sudah dipakai.',
  'action.accounts.pinInvalid': 'PIN harus 6 angka, tidak semuanya sama dan tidak berurutan.',
  'action.accounts.createFailed': 'Akun tidak dapat dibuat. Coba lagi.',
  'action.accounts.created': 'Akun dibuat: {count}.',
  'action.accounts.partial': 'Akun dibuat: {created}. Tidak dibuat: {failed}.',
  'action.accounts.noneCreated': 'Tidak ada akun yang dibuat. Lihat masalah di bawah.',
  'action.accounts.resetDone': 'PIN baru dibuat.',
  'action.accounts.resetNotAllowed': 'Kamu hanya bisa mengatur ulang PIN siswa di sekolahmu.',
  'action.accounts.resetFailed': 'PIN tidak dapat diatur ulang. Coba lagi.',
  'action.accounts.notFound': 'Siswa itu tidak ada di sekolahmu.',
  'action.accounts.updated': 'Data siswa tersimpan.',
  'action.accounts.updateFailed': 'Perubahan tidak dapat disimpan. Coba lagi.',
  'action.accounts.deleted': 'Siswa dihapus.',
  'action.accounts.deleteHasWork':
    'Siswa ini sudah memiliki pekerjaan tersimpan, jadi akunnya tidak dapat dihapus.',
  'action.accounts.deleteFailed': 'Siswa tidak dapat dihapus. Coba lagi.',
}

const idServer: ServerDictionary = {
  // ── Metadata ──
  'meta.applicationName': 'Paspor Laut Digital',
  'meta.default.title': 'Paspor Laut Digital',
  'meta.title.template': '%s · Laut Sahabat Kita',
  'meta.description': 'Teman belajar lapangan dan daring untuk Laut Sahabat Kita.',
  'meta.login.title': 'Masuk',
  'meta.forgot.title': 'Atur ulang kata sandi',
  'meta.reset.title': 'Kata sandi baru',
  'meta.dashboard.title': 'Dasbor',
  'meta.explore.title': 'Jelajah',
  'meta.passport.title': 'Pasporku',
  'meta.badges.title': 'Lencana',
  'meta.journal.title': 'Jurnal',
  'meta.review.title': 'Tinjau kiriman',
  'meta.students.title': 'Siswa',
  'meta.studentsAdd.title': 'Tambah siswa',
  'meta.sessions.title': 'Sesi pembelajaran',
  'meta.programme.title': 'Dampak program',

  // ── Halaman masuk ──
  'loginPage.kicker': 'Teknologi yang bermakna, belajar di dunia nyata',
  'loginPage.heading': 'Setiap kunjungan pulau menjadi bagian dari kisah laut sepanjang hayat.',
  'loginPage.intro':
    'Belajar daring, menjelajah di luar ruang, catat apa yang kamu perhatikan, dan kembangkan Paspor Laut Digitalmu dari waktu ke waktu.',
  'loginPage.islands': 'Gili Bidara · Gili Range · Gili Sarang',
  'loginPage.resetLinkInvalid':
    'Tautan atur ulang tidak valid atau sudah kedaluwarsa. Minta tautan baru.',

  // ── Dasbor siswa ──
  'dashboard.student.kicker': 'Perjalanan lautmu berlanjut',
  'dashboard.student.greeting': 'Selamat datang,',
  'dashboard.student.intro':
    'Setiap pengamatan, pertanyaan, dan tindakan menambah satu halaman baru pada Paspor Lautmu. Ke mana rasa ingin tahumu akan membawamu hari ini?',
  'dashboard.student.continue': 'Lanjutkan menjelajah →',
  'dashboard.student.viewPassport': 'Lihat pasporku',
  'dashboard.student.overallJourney': 'Perjalanan keseluruhan',
  'dashboard.student.progressCount': '{done} dari {total} kegiatan selesai',
  'dashboard.student.stat.badges': 'Lencana diraih',
  'dashboard.student.stat.activities': 'Kegiatan selesai',
  'dashboard.student.stat.time': 'Waktu menjelajah',
  'dashboard.student.stat.habitats': 'Habitat dikunjungi',
  'dashboard.student.islandsEyebrow': 'Pilot tiga pulau',
  'dashboard.student.islandsHeading': 'Pilih pulau berikutnya',
  'dashboard.student.islandsIntro': 'Belajar daring atau bawa paspormu ke lapangan.',
  'dashboard.student.seeAll': 'Lihat semua kegiatan →',

  // ── Dasbor guru ──
  'dashboard.teacher.greeting': 'Selamat siang, {name}',
  'dashboard.teacher.intro': 'Inilah perkembangan para penjelajah laut cilikmu.',
  'dashboard.teacher.awaiting': 'Menunggu',
  'dashboard.teacher.yourReview': 'tinjauanmu',
  'dashboard.teacher.reviewNow': 'Tinjau sekarang',
  'dashboard.teacher.stat.students': 'Siswa aktif',
  'dashboard.teacher.stat.activities': 'Kegiatan selesai',
  'dashboard.teacher.stat.badges': 'Lencana disetujui',
  'dashboard.teacher.stat.fieldSessions': 'Sesi lapangan',
  'dashboard.teacher.delivery': 'Pelaksanaan pembelajaran',
  'dashboard.teacher.logSession': 'Catat sesi →',
  'dashboard.teacher.sessions': 'Sesi',
  'dashboard.teacher.attendances': 'Kehadiran',
  'dashboard.teacher.teachingHours': 'Jam mengajar',
  'dashboard.teacher.habitats': 'Habitat dikunjungi',
  'dashboard.teacher.habitatsEmpty': 'Tambahkan habitat saat mencatat sesi lapangan.',
  'dashboard.teacher.recent': 'Kiriman terbaru',
  'dashboard.teacher.viewQueue': 'Lihat antrean →',

  // ── Kartu pulau ──
  'island.activityCount.one': '{count} kegiatan',
  'island.activityCount.other': '{count} kegiatan',
  'island.explored': '{progress}% dijelajahi',
  'island.explore': 'Jelajahi →',

  // ── Jelajah ──
  'explore.eyebrow': 'Pustaka pembelajaran',
  'explore.heading': 'Jelajahi pulau-pulaunya',
  'explore.intro':
    'Gunakan panduan digital di mana saja, lalu bawa pembelajaranmu ke luar ruang bila memungkinkan. Jalur lapangan maupun daring sama-sama masuk ke dalam paspormu.',
  'explore.filter.all': 'Semua',
  'explore.filter.online': 'Belajar daring',
  'explore.filter.field': 'Di lapangan',
  'explore.filter.allIslands': 'Semua pulau',

  // ── Paspor ──
  'passport.eyebrow': 'Catatan belajar pribadi',
  'passport.heading': 'Paspor Lautku',
  'passport.intro':
    'Catatan yang terus bertumbuh tentang tempat yang kamu jelajahi, pertanyaan yang kamu ajukan, dan kepedulianmu terhadap laut.',
  'passport.label': 'Republik penjaga laut · paspor pembelajar',
  'passport.schoolGrade': '{school} · Kelas {grade}',
  'passport.number': 'No. paspor',
  'passport.village': 'Desa asal',
  'passport.joined': 'Bergabung LSK',
  'passport.seal': 'Pembelajar Laut',
  'passport.sealPlace': 'Selat Alas',
  'passport.outdoorRecord': 'Catatan belajar di luar ruang',
  'passport.sessionCount': 'Sesi yang dicatat guru',
  'passport.learningTime': 'Waktu belajar',
  'passport.habitats': 'Habitat dikunjungi',
  'passport.places': 'Tempat dalam perjalananku',
  'passport.placesEmpty': 'Kunjungan lapangan yang dicatat guru akan muncul di sini.',
  'passport.badgesHeading': 'Lencana paspor',
  'passport.badgesIntro': 'Bukti lapangan ditinjau guru sebelum lencana diberikan.',

  // ── Lencana ──
  'badges.eyebrow': 'Koleksi pencapaian',
  'badges.heading': 'Lencana lautmu',
  'badges.intro':
    'Lencana merayakan pembelajaran, penjelajahan di luar ruang, dan tindakan yang merawat tempat serta masyarakat pesisir.',
  'badges.learningCount': '{count} belajar',
  'badges.explorerCount': '{count} penjelajah',

  // ── Jurnal ──
  'journal.eyebrow': 'Catatan lapangan & refleksi',
  'journal.heading': 'Jurnal belajarku',
  'journal.intro':
    'Pengamatanmu adalah bukti pembelajaran. Nilainya bertambah setiap kali kamu kembali dan menemukan hal baru.',
  'journal.add': 'Tambah pengamatan',
  'journal.openPhoto': 'Buka foto untuk {title}',
  'journal.teacherNote': 'Catatan guru: {note}',
  'journal.emptyTitle': 'Belum ada catatan jurnal',
  'journal.emptyBody': 'Mulai satu kegiatan dan catat apa yang kamu perhatikan.',

  // ── Antrean tinjauan ──
  'reviewPage.eyebrow': 'Tinjauan bukti',
  'reviewPage.heading': 'Antrean persetujuan lencana',
  'reviewPage.intro':
    'Tinjau foto dan refleksi setiap siswa. Setujui bukti yang jelas, atau kembalikan disertai dorongan untuk mencoba lagi.',
  'reviewPage.pendingCount': '{count} menunggu',
  'reviewPage.needsReview': 'Perlu kamu tinjau',
  'reviewPage.recentlyReviewed': 'Baru saja ditinjau',
  'reviewPage.emptyTitle': 'Semua sudah tertangani',
  'reviewPage.emptyBody': 'Tidak ada kiriman yang menunggu untuk ditinjau.',

  // ── Siswa ──
  'students.heading': 'Perkembangan siswa',
  'students.intro':
    'Lihat partisipasi dalam pembelajaran daring, kegiatan lapangan, refleksi, dan lencana yang disetujui.',
  'students.col.student': 'Siswa',
  'students.col.class': 'Kelas',
  'students.col.activities': 'Kegiatan',
  'students.col.badges': 'Lencana',
  'students.col.username': 'Nama pengguna',
  'students.col.signIn': 'Masuk',
  'students.col.manage': 'Kelola',
  'students.addButton': 'Tambah siswa',
  'students.emptyTitle': 'Belum ada siswa yang terdaftar',
  'students.emptyBody': 'Gunakan Tambah siswa untuk membuat akun kelasmu.',

  // ── Tambah siswa ──
  'studentsAdd.eyebrow': 'Akun siswa',
  'studentsAdd.heading': 'Tambah siswa',
  'studentsAdd.intro':
    'Buat data masuk untuk siswamu. Setiap siswa mendapat nama pengguna dan PIN 6 angka.',
  'studentsAdd.back': '← Kembali ke daftar siswa',
  'studentsAdd.notConfiguredTitle': 'Pembuatan akun belum disiapkan',
  'studentsAdd.notConfiguredBody':
    'Administrator perlu menambahkan pengaturan server SUPABASE_SECRET_KEY sebelum akun dapat dibuat di sini.',
  'studentsAdd.noSchoolTitle': 'Akunmu belum memiliki sekolah',
  'studentsAdd.noSchoolBody':
    'Minta administrator JARI menghubungkan akunmu ke sekolah terlebih dahulu.',
  'studentsAdd.noSchoolsTitle': 'Belum ada sekolah',
  'studentsAdd.noSchoolsBody': 'Tambahkan sekolah di Supabase sebelum membuat akun siswa.',

  // ── Sesi pembelajaran ──
  'sessions.eyebrow': 'Catatan pembelajaran guru',
  'sessions.heading': 'Sesi & kehadiran',
  'sessions.intro':
    'Catat pelajaran daring, kunjungan luar ruang, jam belajar, kehadiran, dan refleksi guru tanpa dokumen tambahan.',
  'sessions.logHeading': 'Catat sesi pembelajaran',
  'sessions.savedToSupabase': 'Tersimpan di Supabase',
  'sessions.recentHeading': 'Sesi terbaru',
  'sessions.recordedCount': '{count} tercatat',
  'sessions.generalLsk': 'LSK umum',
  'sessions.noReflection': 'Belum ada refleksi.',
  'sessions.students': 'siswa',
  'sessions.minutes': 'menit',
  'sessions.emptyTitle': 'Belum ada sesi yang tercatat',
  'sessions.emptyBody': 'Gunakan formulir di atas setelah pelajaran atau kunjungan lapanganmu.',

  // ── Dampak program ──
  'programme.eyebrow': 'Dasbor program JARI',
  'programme.heading': 'Dampak literasi laut',
  'programme.intro':
    'Basis bukti langsung tentang partisipasi, pembelajaran, penjelajahan luar ruang, dan kepedulian di seluruh pilot.',
  'programme.pilotLine1': 'Pilot tiga',
  'programme.pilotLine2': 'pulau',
  'programme.stat.schools': 'Sekolah',
  'programme.stat.villages': 'Desa',
  'programme.stat.students': 'Siswa',
  'programme.stat.teachers': 'Guru',
  'programme.participation': 'Partisipasi & pembelajaran',
  'programme.sessions': 'Sesi pembelajaran',
  'programme.fieldVisits': 'Kunjungan lapangan',
  'programme.attendances': 'Kehadiran',
  'programme.learningHours': 'Jam belajar siswa',
  'programme.documented': 'Kegiatan terdokumentasi',
  'programme.awaitingReview': 'Menunggu tinjauan',
  'programme.pathways': 'Jalur pencapaian',
  'programme.learningBadges': 'Lencana pembelajaran daring',
  'programme.explorerBadges': 'Lencana penjelajah terverifikasi',
  'programme.reach': 'Jangkauan sekolah',
  'programme.col.school': 'Sekolah',
  'programme.col.village': 'Desa',
  'programme.col.students': 'Siswa',
  'programme.col.teachers': 'Guru',

  // ── Cadangan konten ──
  'content.badgeFallback': 'Lencana Pembelajaran Laut',
  'content.studentFallback': 'Siswa',
}

export const id: Dictionary = { ...idUi, ...idServer }
