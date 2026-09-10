export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
    company: user.company || null,
    institution: user.institution || null,
    settings: user.settings,
    emailVerified: user.emailVerified,
  }
}
