/**
 * English is the source of truth for every message. `id.ts` is type-checked against it, so adding a
 * key here makes the Indonesian file fail to compile until it is translated.
 *
 * Conventions
 * - Keys are flat and dot-namespaced. Group with comment banners, not nested objects.
 * - `{placeholder}` names are part of the type: `t()` demands exactly the values a message declares.
 * - Keys under `action.` are the only ones a Server Action may return (see `ActionMessageKey`).
 * - Counts that inflect in English use `.one` / `.other` suffixes and a ternary at the call site.
 *
 * `enUiSource` crosses to the browser inside the RSC payload; `enServerSource` never leaves the
 * server. Choosing the section a string lives in is what keeps the client bundle small, and a
 * client component that reaches for a server-only key fails to compile.
 */

export const enUiSource = {
  // ── Brand (product names — identical in both languages) ──
  'brand.name': 'Laut Sahabat Kita',
  'brand.tagline': 'Ocean Passport',
  'brand.schoolFallback': 'LSK',

  // ── Navigation ──
  'nav.dashboard.student': 'My Journey',
  'nav.dashboard.staff': 'Overview',
  'nav.explore': 'Explore',
  'nav.passport': 'Passport',
  'nav.badges': 'Badges',
  'nav.journal': 'Journal',
  'nav.review': 'Review',
  'nav.students': 'Students',
  'nav.sessions': 'Sessions',
  'nav.programme': 'Programme',

  // ── Application shell ──
  'shell.title.student': 'Digital Ocean Passport',
  'shell.title.teacher': 'Teacher workspace',
  'shell.title.jariAdmin': 'JARI programme workspace',
  'shell.nav.primary': 'Primary navigation',
  'shell.nav.mobile': 'Mobile navigation',
  'shell.connectedAs': 'Connected as {role}',
  'shell.signOut': 'Sign out',
  'shell.profileLabel': '{name}, {role}',
  'shell.affiliation': '{role} · {school}',
  'shell.subtitle.student': 'Young explorer',
  'role.student': 'student',
  'role.teacher': 'teacher',
  'role.jariAdmin': 'JARI administrator',
  'roleTitle.teacher': 'Teacher',
  'roleTitle.jariAdmin': 'JARI administrator',

  // ── Progressive web app ──
  'pwa.offlineBanner':
    'You’re offline. Completed work and photos stay on this device and upload after you reconnect.',
  'pwa.installApp': 'Install app',
  'pwa.updateApp': 'Update app',
  'pwa.installHelp.ios': 'In Safari, tap Share, then Add to Home Screen.',
  'pwa.installHelp.manual':
    'Use Install in your browser address bar or menu. If it is unavailable, open the deployed HTTPS site and reload.',

  // ── Offline sync ──
  'sync.uploading': 'Uploading saved work',
  'sync.uploadNow': 'Upload saved work now',
  'sync.syncing': 'Syncing…',
  'sync.waiting': '{count} waiting',

  // ── Error boundary ──
  'error.title': 'We could not load this page.',
  'error.body': 'Check your connection and try again.',
  'error.retry': 'Try again',

  // ── Status labels ──
  'status.pending': 'Pending',
  'status.approved': 'Approved',
  'status.returned': 'Returned',
  'status.earned': 'Earned',
  'status.learning': 'Learning',
  'status.explorer': 'Explorer',
  'status.locked': 'Locked',

  // ── Units ──
  'unit.hoursShort': '{value}h',

  // ── Sign in ──
  'login.eyebrow': 'Welcome back',
  'login.heading': 'Sign in to your passport',
  'login.intro':
    'Students use the username and PIN from their teacher. Teachers use their email address.',
  'login.identifierLabel': 'Email or username',
  'login.identifierPlaceholder': 'name@school.org or siti482',
  'login.passwordLabel': 'Password or PIN',
  'login.passwordPlaceholder': 'Your password or 6-digit PIN',
  'login.submit': 'Sign in →',
  'login.submitPending': 'Signing in…',
  'login.footnote': 'Teachers and students use the same secure sign-in.',
  'login.forgotLink': 'Teacher? Forgot your password',

  // ── Password reset (staff) ──
  'forgot.eyebrow': 'Teachers and administrators',
  'forgot.heading': 'Reset your password',
  'forgot.intro':
    'Enter the email address you sign in with. If it matches an account, we will send a link to choose a new password.',
  'forgot.emailLabel': 'Email address',
  'forgot.emailPlaceholder': 'name@school.org',
  'forgot.submit': 'Send reset link',
  'forgot.submitPending': 'Sending…',
  'forgot.studentNote':
    'Students sign in with a username and PIN. If you forgot your PIN, ask your teacher to reset it.',
  'forgot.backToLogin': '← Back to sign in',
  'reset.eyebrow': 'Account security',
  'reset.heading': 'Choose a new password',
  'reset.intro': 'Use at least 8 characters. Saving signs your account out on other devices.',
  'reset.passwordLabel': 'New password',
  'reset.confirmLabel': 'Confirm new password',
  'reset.submit': 'Save password',
  'reset.submitPending': 'Saving…',

  // ── Activity card ──
  'activity.mode.field': 'Field activity',
  'activity.mode.online': 'Learn online',
  'activity.minutes': '{minutes} min',
  'activity.open.begin': 'Begin',
  'activity.open.review': 'Review',
  'activity.open.pending': 'View submission',
  'activity.open.queued': 'View saved upload',
  'activity.open.returned': 'Try again',
  'activity.submit.saving': 'Saving on device…',
  'activity.submit.field': 'Send to teacher →',
  'activity.submit.online': 'Complete activity →',
  'activity.returnedBy': 'Returned by your teacher:',
  'activity.returnedFallback': 'Please add clearer evidence or more detail.',
  'activity.state.needsAttention': 'Saved upload needs attention',
  'activity.state.savedOnDevice': 'Saved on this device',
  'activity.state.complete': 'Activity complete',
  'activity.state.awaitingApproval': 'Waiting for teacher approval',
  'activity.queued.autoUpload': 'It will upload automatically when internet access returns.',
  'activity.queued.syncNow': 'Sync now',
  'activity.queued.remove': 'Remove',
  'activity.confirmRemove': 'Remove this saved submission and its photo from this device?',
  'activity.photoLabel': 'Photo evidence',
  'activity.photoPrompt': 'Tap to add a field photo',
  'activity.photoHint': 'JPG, PNG, or WebP · maximum 3 MB',
  'activity.reflection.fieldLabel': 'What did you notice?',
  'activity.reflection.onlineLabel': 'Your reflection',
  'activity.reflection.placeholder': 'Write a few sentences in your own words…',
  'activity.draftNote':
    'Draft text is saved on this device. Submitting also stores the photo offline.',
  'activity.cancel': 'Cancel',
  'activity.saved': 'Saved safely on this device. It will upload when internet access returns.',
  'activity.uploadedField': 'Uploaded and sent to your teacher.',
  'activity.uploadedOnline': 'Uploaded and completed.',
  'activity.retryUploaded': 'Saved work uploaded successfully.',
  'activity.stillWaiting': 'Still waiting for an internet connection.',
  'activity.deviceSaveFailed': 'This device could not save the submission.',
  'activity.deviceRetryFailed': 'This device could not retry the saved upload.',
  'activity.deviceRemoveFailed': 'This device could not remove the saved upload.',

  // ── Review card ──
  'review.approve': 'Approve',
  'review.return': 'Return for changes',
  'review.openEvidence': 'Open evidence from {name}',
  'review.viewPhoto': 'View full photo',
  'review.noteLabel': 'Optional review note',
  'review.notePlaceholder': 'Optional feedback',

  // ── Session form ──
  'session.titleLabel': 'Session title',
  'session.titlePlaceholder': 'Mangrove field investigation',
  'session.settingLabel': 'Learning setting',
  'session.type.field': 'Field learning',
  'session.type.online': 'Online learning',
  'session.type.classroom': 'Classroom preparation',
  'session.type.community': 'Community activity',
  'session.dateLabel': 'Date',
  'session.durationLabel': 'Duration in minutes',
  'session.islandLabel': 'Island',
  'session.islandNone': 'Not island-specific',
  'session.habitatLabel': 'Habitat visited',
  'session.habitatPlaceholder': 'Mangrove, seagrass, reef…',
  'session.studentsLabel': 'Students present',
  'session.grade': 'Grade {grade}',
  'session.noStudents': 'No students are assigned to this school yet.',
  'session.reflectionLabel': 'Teacher reflection',
  'session.reflectionPlaceholder': 'What worked well? What should change next time?',
  'session.observationLabel': 'Field observation',
  'session.observationPlaceholder': 'Conditions, species, student questions, or safety notes…',
  'session.save': 'Save session',
  'session.savePending': 'Saving session…',

  // ── Student accounts ──
  'accounts.schoolLabel': 'School',
  'accounts.schoolPlaceholder': 'Choose a school',
  'accounts.schoolFixed': 'Students will be added to {school}.',
  'accounts.manualHeading': 'Enter students',
  'accounts.manualIntro':
    'Only the full name is required. Leave username and PIN blank and they will be created for you.',
  'accounts.col.row': '#',
  'accounts.col.fullName': 'Full name',
  'accounts.col.grade': 'Grade',
  'accounts.col.username': 'Username',
  'accounts.col.pin': 'PIN',
  'accounts.autoPlaceholder': 'auto',
  'accounts.removeRow': 'Remove row {row}',
  'accounts.addRow': '+ Add row',
  'accounts.rowLimit': 'Up to {max} students at a time.',
  'accounts.rowProblem': 'Row {row}: {problem}',
  'accounts.submit': 'Create accounts',
  'accounts.submitPending': 'Creating accounts…',
  'accounts.csvHeading': 'Upload a CSV file',
  'accounts.csvIntro':
    'Upload a class list to fill the table. You can check and edit every row before creating accounts.',
  'accounts.csvChoose': 'Tap to choose a CSV file',
  'accounts.csvLoaded': '{count} rows loaded from {file}. Check them in the table above.',
  'accounts.csvFormatHeading': 'Required file format',
  'accounts.csvFormatHeader':
    'The first row must contain the column names below. Column order does not matter.',
  'accounts.csvFormatColumn': 'Column',
  'accounts.csvFormatRequired': 'Required',
  'accounts.csvFormatMeaning': 'What to enter',
  'accounts.csvFormatYes': 'Yes',
  'accounts.csvFormatNo': 'No',
  'accounts.csvFormatFullName': 'Student’s full name',
  'accounts.csvFormatGrade': 'Class or grade, for example 5',
  'accounts.csvFormatUsername':
    '3–32 characters: lowercase letters, numbers, dot, dash or underscore. Leave blank to generate.',
  'accounts.csvFormatPin':
    '6 digits, not all the same and not in order (not 123456). Leave blank to generate.',
  'accounts.csvFormatNotes':
    'Save as CSV (UTF-8). Commas or semicolons both work. Maximum {max} students per file.',
  'accounts.csvFormatExample': 'Example',
  'accounts.csvTemplate': 'Download template',
  'accounts.csv.empty': 'The file is empty.',
  'accounts.csv.missingColumn': 'The first row must include a full_name column.',
  'accounts.csv.missingName': 'Line {line}: full_name is empty.',
  'accounts.csv.tooManyRows': 'The file has more than {max} students. Split it into smaller files.',
  'accounts.csv.unclosedQuote': 'Line {line}: a quotation mark is not closed.',
  'accounts.csv.unreadable': 'The file could not be read.',
  'accounts.results.heading': 'Accounts created',
  'accounts.results.warning':
    'Print or write down these PINs now. They are shown only once and cannot be viewed again. A lost PIN can be reset from the Students page.',
  'accounts.results.signInHint': 'Students sign in to the app with their username and PIN.',
  'accounts.results.print': 'Print',
  'accounts.results.download': 'Download sign-in details (CSV)',
  'accounts.results.addMore': 'Add more students',
  'accounts.results.failedHeading': 'Not created',
  'accounts.results.problem': 'Problem',
  'accounts.reset.button': 'Reset PIN',
  'accounts.reset.pending': 'Resetting…',
  'accounts.reset.confirm': 'Create a new PIN for {name}? Their current PIN will stop working.',
  'accounts.reset.newPin': 'New PIN',
  'accounts.reset.shownOnce': 'Shown once. Write it down now.',
  'accounts.emailSignIn': 'Email sign-in',
  'accounts.edit.button': 'Edit',
  'accounts.edit.save': 'Save changes',
  'accounts.edit.saving': 'Saving…',
  'accounts.edit.close': 'Close',
  'accounts.delete.button': 'Delete',
  'accounts.delete.pending': 'Deleting…',
  'accounts.delete.confirm':
    'Delete {name}? Their account and sign-in are removed. This cannot be undone.',
  'accounts.delete.blocked': 'Students with saved work cannot be deleted.',

  // ── Sign-in results ──
  'action.login.invalidIdentifier': 'Enter your email address or username.',
  'action.login.invalidUsername': 'That username is not valid. Check it with your teacher.',
  'action.login.invalidEmail': 'Enter a valid email address.',
  'action.login.passwordTooShort': 'Password must be at least 6 characters.',
  'action.login.invalidCredentials':
    'Those sign-in details do not match. Check them and try again.',
  'action.login.emailNotConfirmed': 'Confirm your email address before signing in.',
  'action.login.tooManyAttempts': 'Too many sign-in attempts. Wait a moment and try again.',
  'action.login.failed': 'Sign-in could not be completed. Try again in a moment.',

  // ── Password reset results ──
  'action.forgot.sent':
    'If that email belongs to a teacher or administrator account, a reset link is on its way. Check your inbox and spam folder.',
  'action.forgot.invalidEmail': 'Enter a valid email address.',
  'action.forgot.studentAccount':
    'Students cannot reset a PIN by email. Ask your teacher to reset it.',
  'action.forgot.tooManyRequests': 'Too many reset requests. Wait a few minutes and try again.',
  'action.forgot.failed':
    'The reset email could not be sent. Try again later or ask your JARI administrator.',
  'action.reset.tooShort': 'Use at least 8 characters.',
  'action.reset.tooLong': 'Use 72 characters or fewer.',
  'action.reset.mismatch': 'The two passwords do not match.',
  'action.reset.samePassword': 'Choose a password different from your current one.',
  'action.reset.weak': 'That password is too easy to guess. Choose a stronger one.',
  'action.reset.failed': 'The password could not be saved. Request a new reset link and try again.',

  // ── Review results ──
  'action.review.noteRequired': 'Add a short note explaining what the student should improve.',
  'action.review.invalid': 'Check the review details and try again.',
  'action.review.failed': 'The review could not be saved. Try again in a moment.',
  'action.review.approved': 'Badge approved.',
  'action.review.returned': 'Submission returned.',

  // ── Learning session results ──
  'action.session.titleTooShort': 'Add a clear session title.',
  'action.session.durationInvalid': 'Enter a duration between 5 and 600 minutes.',
  'action.session.invalid': 'Check the session details and try again.',
  'action.session.migrationRequired': 'Run the latest supabase/schema.sql before logging sessions.',
  'action.session.failed': 'The session could not be saved. Try again in a moment.',
  'action.session.saved': 'Learning session saved.',

  // ── Submission results (shared by the client form and the upload endpoint) ──
  'action.submission.reflectionTooShort': 'Write at least ten characters in your reflection.',
  'action.submission.photoRequired': 'Field activities require a photo.',
  'action.submission.photoTooLarge': 'Photos must be smaller than 3 MB.',
  'action.submission.photoWrongType': 'Use a JPG, PNG, or WebP image.',
  'action.submission.invalid': 'Check the submission and try again.',
  'action.submission.signInAgain': 'Sign in again to upload the saved submission.',
  'action.submission.wrongAccount': 'This saved submission belongs to a different student account.',
  'action.submission.studentsOnly': 'Only student accounts can submit activities.',
  'action.submission.activityNotFound': 'Activity not found.',
  'action.submission.migrationRequired':
    'Run the offline-sync database migration before uploading saved submissions.',
  'action.submission.lookupFailed':
    'Saved submissions could not be checked. Try again in a moment.',
  'action.submission.alreadySent': 'Already sent to your teacher.',
  'action.submission.alreadyUploaded': 'Already uploaded.',
  'action.submission.alreadySubmitted': 'This activity is already submitted.',
  'action.submission.uploadFailed':
    'The photo could not be uploaded. Try again when your connection is stronger.',
  'action.submission.uploaded': 'Submission uploaded.',
  'action.submission.saveFailed': 'The submission could not be saved. Try again in a moment.',
  'action.submission.sentForReview': 'Sent to your teacher for review.',
  'action.submission.completed': 'Activity completed.',

  // ── Offline queue results (also written by the service worker) ──
  'action.sync.waitingForConnection': 'Waiting for an internet connection.',
  'action.sync.uploadFailed': 'Upload failed ({status}).',
  'action.sync.storageUnavailable': 'Could not open device storage.',

  // ── Student account results ──
  'action.accounts.notConfigured':
    'Account creation is not set up on this server yet. Ask your JARI administrator.',
  'action.accounts.notAllowed':
    'Only teachers and JARI administrators can manage student accounts.',
  'action.accounts.noSchool':
    'Your account is not linked to a school yet. Ask your JARI administrator.',
  'action.accounts.invalidSchool': 'Choose a school.',
  'action.accounts.invalidRows':
    'The student list could not be read. Refresh the page and try again.',
  'action.accounts.noRows': 'Add at least one student.',
  'action.accounts.tooManyRows': 'You can add up to {max} students at a time.',
  'action.accounts.fixRows': 'No accounts were created. Fix the rows marked below and try again.',
  'action.accounts.nameRequired': 'Full name is required.',
  'action.accounts.nameTooLong': 'Full name must be 80 characters or fewer.',
  'action.accounts.gradeTooLong': 'Grade must be 10 characters or fewer.',
  'action.accounts.usernameInvalid':
    'Username must be 3–32 characters: lowercase letters, numbers, dots, dashes or underscores.',
  'action.accounts.usernameDuplicate': 'This username is used more than once in the list.',
  'action.accounts.usernameTaken': 'This username is already taken.',
  'action.accounts.pinInvalid': 'PIN must be 6 digits, not all the same and not in order.',
  'action.accounts.createFailed': 'The account could not be created. Try again.',
  'action.accounts.created': 'Accounts created: {count}.',
  'action.accounts.partial': 'Accounts created: {created}. Not created: {failed}.',
  'action.accounts.noneCreated': 'No accounts were created. See the problems below.',
  'action.accounts.resetDone': 'New PIN created.',
  'action.accounts.resetNotAllowed': 'You can only reset PINs for students in your school.',
  'action.accounts.resetFailed': 'The PIN could not be reset. Try again.',
  'action.accounts.notFound': 'That student is not in your school.',
  'action.accounts.updated': 'Student details saved.',
  'action.accounts.updateFailed': 'The changes could not be saved. Try again.',
  'action.accounts.deleted': 'Student deleted.',
  'action.accounts.deleteHasWork':
    'This student already has saved work, so the account cannot be deleted.',
  'action.accounts.deleteFailed': 'The student could not be deleted. Try again.',
} as const

export const enServerSource = {
  // ── Metadata ──
  'meta.applicationName': 'Digital Ocean Passport',
  'meta.default.title': 'Digital Ocean Passport',
  'meta.title.template': '%s · Laut Sahabat Kita',
  'meta.description': 'A field and online learning companion for Laut Sahabat Kita.',
  'meta.login.title': 'Sign in',
  'meta.forgot.title': 'Reset password',
  'meta.reset.title': 'New password',
  'meta.dashboard.title': 'Dashboard',
  'meta.explore.title': 'Explore',
  'meta.passport.title': 'My Passport',
  'meta.badges.title': 'Badges',
  'meta.journal.title': 'Journal',
  'meta.review.title': 'Review submissions',
  'meta.students.title': 'Students',
  'meta.studentsAdd.title': 'Add students',
  'meta.sessions.title': 'Learning sessions',
  'meta.programme.title': 'Programme impact',

  // ── Sign-in page ──
  'loginPage.kicker': 'Purposeful technology, real-world learning',
  'loginPage.heading': 'Every island visit becomes part of a lifelong ocean story.',
  'loginPage.intro':
    'Learn online, explore outdoors, document what you notice, and grow your Digital Ocean Passport over time.',
  'loginPage.islands': 'Gili Bidara · Gili Range · Gili Sarang',
  'loginPage.resetLinkInvalid': 'That reset link is invalid or has expired. Request a new one.',

  // ── Student dashboard ──
  'dashboard.student.kicker': 'Your ocean journey continues',
  'dashboard.student.greeting': 'Welcome,',
  'dashboard.student.intro':
    'Every observation, question, and action adds a new page to your Ocean Passport. Where will your curiosity take you today?',
  'dashboard.student.continue': 'Continue exploring →',
  'dashboard.student.viewPassport': 'View my passport',
  'dashboard.student.overallJourney': 'Overall journey',
  'dashboard.student.progressCount': '{done} of {total} activities complete',
  'dashboard.student.stat.badges': 'Badges earned',
  'dashboard.student.stat.activities': 'Activities complete',
  'dashboard.student.stat.time': 'Time exploring',
  'dashboard.student.stat.habitats': 'Habitats visited',
  'dashboard.student.islandsEyebrow': 'Three island pilot',
  'dashboard.student.islandsHeading': 'Choose your next island',
  'dashboard.student.islandsIntro': 'Learn online or take your passport into the field.',
  'dashboard.student.seeAll': 'See all activities →',

  // ── Teacher dashboard ──
  'dashboard.teacher.greeting': 'Good afternoon, {name}',
  'dashboard.teacher.intro': 'Here is how your young ocean explorers are progressing.',
  'dashboard.teacher.awaiting': 'Awaiting',
  'dashboard.teacher.yourReview': 'your review',
  'dashboard.teacher.reviewNow': 'Review now',
  'dashboard.teacher.stat.students': 'Active students',
  'dashboard.teacher.stat.activities': 'Activities complete',
  'dashboard.teacher.stat.badges': 'Badges approved',
  'dashboard.teacher.stat.fieldSessions': 'Field sessions',
  'dashboard.teacher.delivery': 'Learning delivery',
  'dashboard.teacher.logSession': 'Log a session →',
  'dashboard.teacher.sessions': 'Sessions',
  'dashboard.teacher.attendances': 'Attendances',
  'dashboard.teacher.teachingHours': 'Teaching hours',
  'dashboard.teacher.habitats': 'Habitats visited',
  'dashboard.teacher.habitatsEmpty': 'Add habitats when logging field sessions.',
  'dashboard.teacher.recent': 'Recent submissions',
  'dashboard.teacher.viewQueue': 'View queue →',

  // ── Island card ──
  'island.activityCount.one': '{count} activity',
  'island.activityCount.other': '{count} activities',
  'island.explored': '{progress}% explored',
  'island.explore': 'Explore →',

  // ── Explore ──
  'explore.eyebrow': 'Learning library',
  'explore.heading': 'Explore the islands',
  'explore.intro':
    'Use the digital guide anywhere, then take your learning outside when you can. Field and online pathways both belong in your passport.',
  'explore.filter.all': 'All',
  'explore.filter.online': 'Learn online',
  'explore.filter.field': 'In the field',
  'explore.filter.allIslands': 'All islands',

  // ── Passport ──
  'passport.eyebrow': 'Personal learning record',
  'passport.heading': 'My Ocean Passport',
  'passport.intro':
    'A growing record of the places you explore, the questions you ask, and the care you show for the ocean.',
  'passport.label': 'Republic of ocean stewards · learner passport',
  'passport.schoolGrade': '{school} · Grade {grade}',
  'passport.number': 'Passport no.',
  'passport.village': 'Home village',
  'passport.joined': 'Joined LSK',
  'passport.seal': 'Ocean Learner',
  'passport.sealPlace': 'Alas Strait',
  'passport.outdoorRecord': 'Outdoor learning record',
  'passport.sessionCount': 'Teacher-recorded sessions',
  'passport.learningTime': 'Learning time',
  'passport.habitats': 'Habitats visited',
  'passport.places': 'Places in my journey',
  'passport.placesEmpty': 'Teacher-recorded field visits will appear here.',
  'passport.badgesHeading': 'Passport badges',
  'passport.badgesIntro': 'Field evidence is reviewed by a teacher before a badge is awarded.',

  // ── Badges ──
  'badges.eyebrow': 'Achievement collection',
  'badges.heading': 'Your ocean badges',
  'badges.intro':
    'Badges celebrate learning, outdoor exploration, and actions that care for marine places and communities.',
  'badges.learningCount': '{count} learning',
  'badges.explorerCount': '{count} explorer',

  // ── Journal ──
  'journal.eyebrow': 'Field notes & reflections',
  'journal.heading': 'My learning journal',
  'journal.intro':
    'Your observations are evidence of learning. They become more valuable every time you return and notice something new.',
  'journal.add': 'Add an observation',
  'journal.openPhoto': 'Open photo for {title}',
  'journal.teacherNote': 'Teacher note: {note}',
  'journal.emptyTitle': 'No journal entries yet',
  'journal.emptyBody': 'Start an activity and record what you notice.',

  // ── Review queue ──
  'reviewPage.eyebrow': 'Evidence review',
  'reviewPage.heading': 'Badge approval queue',
  'reviewPage.intro':
    'Review each student’s photo and reflection. Approve clear evidence or return it with encouragement to try again.',
  'reviewPage.pendingCount': '{count} pending',
  'reviewPage.needsReview': 'Needs your review',
  'reviewPage.recentlyReviewed': 'Recently reviewed',
  'reviewPage.emptyTitle': 'You are all caught up',
  'reviewPage.emptyBody': 'No submissions are waiting for review.',

  // ── Students ──
  'students.heading': 'Student progress',
  'students.intro':
    'See participation across online learning, field activities, reflections, and approved badges.',
  'students.col.student': 'Student',
  'students.col.class': 'Class',
  'students.col.activities': 'Activities',
  'students.col.badges': 'Badges',
  'students.col.username': 'Username',
  'students.col.signIn': 'Sign-in',
  'students.col.manage': 'Manage',
  'students.addButton': 'Add students',
  'students.emptyTitle': 'No students assigned',
  'students.emptyBody': 'Use Add students to create accounts for your class.',

  // ── Add students ──
  'studentsAdd.eyebrow': 'Student accounts',
  'studentsAdd.heading': 'Add students',
  'studentsAdd.intro':
    'Create sign-in details for your students. Each student gets a username and a 6-digit PIN.',
  'studentsAdd.back': '← Back to students',
  'studentsAdd.notConfiguredTitle': 'Account creation is not set up',
  'studentsAdd.notConfiguredBody':
    'An administrator needs to add the SUPABASE_SECRET_KEY server setting before accounts can be created here.',
  'studentsAdd.noSchoolTitle': 'Your account has no school',
  'studentsAdd.noSchoolBody': 'Ask your JARI administrator to link your account to a school first.',
  'studentsAdd.noSchoolsTitle': 'No schools yet',
  'studentsAdd.noSchoolsBody': 'Add a school in Supabase before creating student accounts.',

  // ── Learning sessions ──
  'sessions.eyebrow': 'Teacher learning record',
  'sessions.heading': 'Sessions & attendance',
  'sessions.intro':
    'Record online lessons, outdoor visits, learning hours, attendance, and teacher reflections without extra paperwork.',
  'sessions.logHeading': 'Log a learning session',
  'sessions.savedToSupabase': 'Saved to Supabase',
  'sessions.recentHeading': 'Recent sessions',
  'sessions.recordedCount': '{count} recorded',
  'sessions.generalLsk': 'General LSK',
  'sessions.noReflection': 'No reflection added.',
  'sessions.students': 'students',
  'sessions.minutes': 'minutes',
  'sessions.emptyTitle': 'No sessions recorded yet',
  'sessions.emptyBody': 'Use the form above after your next lesson or field visit.',

  // ── Programme impact ──
  'programme.eyebrow': 'JARI programme dashboard',
  'programme.heading': 'Ocean literacy impact',
  'programme.intro':
    'A live evidence base for participation, learning, outdoor exploration, and stewardship across the pilot.',
  'programme.pilotLine1': 'Three-island',
  'programme.pilotLine2': 'pilot',
  'programme.stat.schools': 'Schools',
  'programme.stat.villages': 'Villages',
  'programme.stat.students': 'Students',
  'programme.stat.teachers': 'Teachers',
  'programme.participation': 'Participation & learning',
  'programme.sessions': 'Learning sessions',
  'programme.fieldVisits': 'Field visits',
  'programme.attendances': 'Attendances',
  'programme.learningHours': 'Student learning hours',
  'programme.documented': 'Documented activities',
  'programme.awaitingReview': 'Awaiting review',
  'programme.pathways': 'Achievement pathways',
  'programme.learningBadges': 'Online learning badges',
  'programme.explorerBadges': 'Verified explorer badges',
  'programme.reach': 'School reach',
  'programme.col.school': 'School',
  'programme.col.village': 'Village',
  'programme.col.students': 'Students',
  'programme.col.teachers': 'Teachers',

  // ── Content fallbacks ──
  'content.badgeFallback': 'Ocean Learning Badge',
  'content.studentFallback': 'Student',
} as const

export const enSource = { ...enUiSource, ...enServerSource }

export type MessageSource = typeof enSource
export type MessageKey = keyof MessageSource
export type UiMessageKey = keyof typeof enUiSource
export type ServerMessageKey = keyof typeof enServerSource

/** The only keys a Server Action may return, so every one of them is guaranteed to reach the browser. */
export type ActionMessageKey = Extract<UiMessageKey, `action.${string}`>

export type Dictionary = { [Key in MessageKey]: string }
export type UiDictionary = { [Key in UiMessageKey]: string }
export type ServerDictionary = { [Key in ServerMessageKey]: string }
