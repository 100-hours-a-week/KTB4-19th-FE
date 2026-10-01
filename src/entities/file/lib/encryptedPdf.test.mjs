import assert from 'node:assert/strict';
import test from 'node:test';
import { isEncryptedPdf } from './encryptedPdf.mjs';

const plainPdf =
  '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
const encryptedPdf =
  '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n5 0 obj\n<< /Filter /Standard /V 2 >>\nendobj\n' +
  'trailer\n<< /Root 1 0 R /Encrypt 5 0 R >>\n%%EOF';

test('allows a PDF without an encryption dictionary', async () => {
  const file = new File([plainPdf], 'rule.pdf', { type: 'application/pdf' });
  assert.equal(await isEncryptedPdf(file), false);
});

test('blocks a PDF whose trailer points to an encryption dictionary', async () => {
  const file = new File([encryptedPdf], 'locked.pdf', {
    type: 'application/pdf',
  });
  assert.equal(await isEncryptedPdf(file), true);
});

test('detects PDFs by extension when the browser gives no MIME type', async () => {
  const file = new File([encryptedPdf], 'locked.PDF', { type: '' });
  assert.equal(await isEncryptedPdf(file), true);
});

test('does not inspect image files', async () => {
  const file = new File(['/Encrypt'], 'rule.png', { type: 'image/png' });
  assert.equal(await isEncryptedPdf(file), false);
});
