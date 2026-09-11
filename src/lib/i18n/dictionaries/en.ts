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
  'login.intro': 'Use the account provided by your teacher or JARI coordinator.',
  'login.emailLabel': 'Email address',
  'login.emailPlaceholder': 'name@school.org',
  'login.passwordLabel': 'Password',
  'login.passwordPlaceholder': 'Your password',
  'login.submit': 'Sign in →',
  'login.submitPending': 'Signing in…',
  'login.footnote': 'Teachers and students use the same secure sign-in.',

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

  // ── Sign-in results ──
  'action.login.invalidEmail': 'Enter a valid email address.',
  'action.login.passwordTooShort': 'Password must be at least 6 characters.',
  'action.login.invalidCredentials':
    'That email and password do not match. Check them and try again.',
  'action.login.emailNotConfirmed': 'Confirm your email address before signing in.',
  'action.login.tooManyAttempts': 'Too many sign-in attempts. Wait a moment and try again.',
  'action.login.failed': 'Sign-in could not be completed. Try again in a moment.',

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
} as const

export const enServerSource = {
  // ── Metadata ──
  'meta.applicationName': 'Digital Ocean Passport',
  'meta.default.title': 'Digital Ocean Passport',
  'meta.title.template': '%s · Laut Sahabat Kita',
  'meta.description': 'A field and online learning companion for Laut Sahabat Kita.',
  'meta.login.title': 'Sign in',
  'meta.dashboard.title': 'Dashboard',
  'meta.explore.title': 'Explore',
  'meta.passport.title': 'My Passport',
  'meta.badges.title': 'Badges',
  'meta.journal.title': 'Journal',
  'meta.review.title': 'Review submissions',
  'meta.students.title': 'Students',
  'meta.sessions.title': 'Learning sessions',
  'meta.programme.title': 'Programme impact',

  // ── Sign-in page ──
  'loginPage.kicker': 'Purposeful technology, real-world learning',
  'loginPage.heading': 'Every island visit becomes part of a lifelong ocean story.',
  'loginPage.intro':
    'Learn online, explore outdoors, document what you notice, and grow your Digital Ocean Passport over time.',
  'loginPage.islands': 'Gili Bidara · Gili Range · Gili Sarang',

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
  'students.emptyTitle': 'No students assigned',
  'students.emptyBody': 'Assign student profiles to this teacher’s school in Supabase.',

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
