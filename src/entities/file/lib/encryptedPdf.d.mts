export const ENCRYPTED_PDF_MESSAGE: string;
export function isPdfFile(file: File): boolean;
export function isEncryptedPdf(file: File): Promise<boolean>;
