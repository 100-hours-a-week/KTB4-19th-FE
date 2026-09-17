export function buildManagerProfileRequest({ userName, phone, marketingAgreed }) {
  return {
    userName: userName.trim(),
    phone: phone.replace(/[^0-9]/g, ""),
    agreements: [
      { termsType: "SERVICE", isAgreed: true },
      { termsType: "PRIVACY", isAgreed: true },
      { termsType: "MARKETING", isAgreed: marketingAgreed },
    ],
  };
}
