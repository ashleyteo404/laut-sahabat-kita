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
  'login.intro': 'Gunakan akun yang diberikan gurumu atau koordinator JARI.',
  'login.emailLabel': 'Alamat email',
  'login.emailPlaceholder': 'nama@sekolah.org',
  'login.passwordLabel': 'Kata sandi',
  'login.passwordPlaceholder': 'Kata sandimu',
  'login.submit': 'Masuk →',
  'login.submitPending': 'Sedang masuk…',
  'login.footnote': 'Guru dan siswa menggunakan cara masuk aman yang sama.',

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

  // ── Hasil proses masuk ──
  'action.login.invalidEmail': 'Masukkan alamat email yang valid.',
  'action.login.passwordTooShort': 'Kata sandi minimal 6 karakter.',
  'action.login.invalidCredentials': 'Email dan kata sandi tidak cocok. Periksa lalu coba lagi.',
  'action.login.emailNotConfirmed': 'Konfirmasi alamat emailmu sebelum masuk.',
  'action.login.tooManyAttempts': 'Terlalu banyak percobaan masuk. Tunggu sebentar lalu coba lagi.',
  'action.login.failed': 'Proses masuk tidak dapat diselesaikan. Coba lagi sebentar lagi.',

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
}

const idServer: ServerDictionary = {
  // ── Metadata ──
  'meta.applicationName': 'Paspor Laut Digital',
  'meta.default.title': 'Paspor Laut Digital',
  'meta.title.template': '%s · Laut Sahabat Kita',
  'meta.description': 'Teman belajar lapangan dan daring untuk Laut Sahabat Kita.',
  'meta.login.title': 'Masuk',
  'meta.dashboard.title': 'Dasbor',
  'meta.explore.title': 'Jelajah',
  'meta.passport.title': 'Pasporku',
  'meta.badges.title': 'Lencana',
  'meta.journal.title': 'Jurnal',
  'meta.review.title': 'Tinjau kiriman',
  'meta.students.title': 'Siswa',
  'meta.sessions.title': 'Sesi pembelajaran',
  'meta.programme.title': 'Dampak program',

  // ── Halaman masuk ──
  'loginPage.kicker': 'Teknologi yang bermakna, belajar di dunia nyata',
  'loginPage.heading': 'Setiap kunjungan pulau menjadi bagian dari kisah laut sepanjang hayat.',
  'loginPage.intro':
    'Belajar daring, menjelajah di luar ruang, catat apa yang kamu perhatikan, dan kembangkan Paspor Laut Digitalmu dari waktu ke waktu.',
  'loginPage.islands': 'Gili Bidara · Gili Range · Gili Sarang',

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
  'students.emptyTitle': 'Belum ada siswa yang terdaftar',
  'students.emptyBody': 'Tautkan profil siswa ke sekolah guru ini di Supabase.',

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
