/**
 * @param {{email: string, password: string, passwordConfirm: string, userName: string, phone: string, acceptedRequiredTerms: boolean}} form
 */
export function buildSignupRequest(form) {
  const agreed = form.acceptedRequiredTerms;
  return {
    email: form.email.trim(),
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    userName: form.userName.trim() || null,
    phone: form.phone.trim() || null,
    agreements: [
      { termsType: "SERVICE", isAgreed: agreed },
      { termsType: "PRIVACY", isAgreed: agreed },
      { termsType: "MARKETING", isAgreed: false },
    ],
  };
}
