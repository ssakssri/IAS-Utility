export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: '최소 8자 이상이어야 합니다.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: '대문자를 포함해야 합니다.' };
  if (!/[a-z]/.test(password)) return { valid: false, message: '소문자를 포함해야 합니다.' };
  if (!/[0-9]/.test(password)) return { valid: false, message: '숫자를 포함해야 합니다.' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: '특수문자를 포함해야 합니다.' };
  }
  return { valid: true };
}
