import assert from 'node:assert/strict';
import test from 'node:test';
import {
  imageSelectionError,
  imageSizeError,
  isHeicImage,
  maxImageBytes,
  toJpgName,
} from './imageRules.mjs';

const jpg = { name: 'leak.jpg', type: 'image/jpeg' };
const png = { name: 'crack.png', type: 'image/png' };
const heic = { name: 'IMG_0001.HEIC', type: '' };

test('jpg, png, heic 사진은 첨부할 수 있다', () => {
  assert.equal(imageSelectionError(0, [jpg, png, heic]), null);
});

test('이미 붙인 사진을 포함해 3장을 넘으면 거부한다', () => {
  assert.equal(
    imageSelectionError(2, [jpg, png]),
    '사진은 3장까지 첨부할 수 있어요.',
  );
});

test('사진이 아닌 파일은 거부한다', () => {
  assert.equal(
    imageSelectionError(0, [{ name: 'rule.pdf', type: 'application/pdf' }]),
    'JPG, PNG, HEIC 사진만 첨부할 수 있어요.',
  );
});

test('HEIC는 타입이나 확장자로 판별한다', () => {
  assert.equal(isHeicImage({ name: 'photo', type: 'image/heic' }), true);
  assert.equal(isHeicImage({ name: 'photo.heif', type: '' }), true);
  assert.equal(isHeicImage(jpg), false);
});

test('변환한 HEIC 파일 이름은 jpg로 바꾼다', () => {
  assert.equal(toJpgName('IMG_0001.HEIC'), 'IMG_0001.jpg');
  assert.equal(toJpgName('my.photo.heic'), 'my.photo.jpg');
  assert.equal(toJpgName('photo'), 'photo.jpg');
});

test('10MB를 넘는 사진은 거부한다', () => {
  assert.equal(imageSizeError([{ size: maxImageBytes }]), null);
  assert.equal(
    imageSizeError([{ size: maxImageBytes + 1 }]),
    '사진은 한 장에 10MB 이하만 첨부할 수 있어요.',
  );
});

test('확장자 대소문자와 상관없이 타입이나 확장자로 판별한다', () => {
  assert.equal(
    imageSelectionError(0, [
      { name: 'LEAK.JPG', type: '' },
      { name: 'crack.jpeg', type: '' },
      { name: 'camera-upload', type: 'image/png' },
    ]),
    null,
  );
});

test('서버가 받지 않는 gif와 webp는 거부한다', () => {
  assert.equal(
    imageSelectionError(0, [{ name: 'motion.gif', type: 'image/gif' }]),
    'JPG, PNG, HEIC 사진만 첨부할 수 있어요.',
  );
  assert.equal(
    imageSelectionError(0, [{ name: 'shot.webp', type: 'image/webp' }]),
    'JPG, PNG, HEIC 사진만 첨부할 수 있어요.',
  );
});
