export const colors = {
  bg: '#0a0f14',
  card: '#0d1620',
  bar: '#0d1620',
  border: '#1a2a3a',
  borderAccent: '#7EC8E3',

  accent: '#7EC8E3',
  accentDark: '#185FA5',
  accentDim: '#3a6a7a',

  textPrimary: '#b0d8ea',
  textSecondary: '#3a6a7a',
  textMuted: '#2a4a5a',

  success: '#5aaa8a',
  successBg: '#0d2a1a',
  successBorder: '#1a4a2a',

  danger: '#cc4444',
  dangerBg: '#2a0d0d',

  warning: '#aa8a3a',
  warningBg: '#2a1a0d',
  warningBorder: '#3a2a0d',

  infoBg: '#0d1a2a',
  infoBorder: '#1a2a4a',
} as const

export const font = {
  body: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  heading: 'BarlowCondensed_700Bold',
  headingMedium: 'BarlowCondensed_600SemiBold',
  label: 'BarlowCondensed_600SemiBold',
} as const

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 20,
} as const

export const s = {
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  cardAccent: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 12,
    marginBottom: 8,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerTitle: {
    fontFamily: font.heading,
    fontSize: 18,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontFamily: font.heading,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: font.label,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  value: {
    fontFamily: font.heading,
    fontSize: 13,
    color: colors.accent,
  },
  cardTitle: {
    fontFamily: font.heading,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  meta: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  btnPrimaryText: {
    fontFamily: font.heading,
    fontSize: 14,
    color: colors.bg,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  btnOutline: {
    borderWidth: 0.5,
    borderColor: colors.accentDim,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  btnOutlineText: {
    fontFamily: font.heading,
    fontSize: 14,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: font.label,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
} as const

export const sportTag = (color: 'green' | 'blue' | 'booked' = 'green') => ({
  backgroundColor: color === 'booked' ? colors.accentDark : colors.accent,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: radius.sm,
  fontFamily: font.heading,
  fontSize: 10,
  color: colors.bg,
  letterSpacing: 0.6,
  textTransform: 'uppercase' as const,
})

export const statusBadge = (type: 'confirmed' | 'completed' | 'pending') => {
  const map = {
    confirmed: { bg: colors.successBg, text: colors.success, border: colors.successBorder },
    completed: { bg: colors.infoBg, text: colors.accent, border: colors.infoBorder },
    pending: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder },
  }
  const t = map[type]
  return {
    badge: {
      backgroundColor: t.bg,
      borderWidth: 0.5,
      borderColor: t.border,
      borderRadius: radius.sm,
      paddingHorizontal: 8,
      paddingVertical: 2,
      alignSelf: 'flex-start' as const,
      marginBottom: 6,
    },
    text: {
      fontFamily: font.label,
      fontSize: 10,
      color: t.text,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
    },
  }
}
