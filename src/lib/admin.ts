export const ADMIN_EMAIL = 'kevinguerrier.kg@gmail.com';

export const isAdminEmail = (email: string | undefined | null) => {
  return email?.toLowerCase() === ADMIN_EMAIL;
};
