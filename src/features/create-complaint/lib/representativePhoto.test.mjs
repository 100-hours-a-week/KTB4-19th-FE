import assert from 'node:assert/strict';
import test from 'node:test';
import {
  representativePhotoId,
  residentPhotos,
} from './representativePhoto.mjs';

const first = { attachmentId: 31, seq: 1 };
const second = { attachmentId: 32, seq: 2 };
const third = { attachmentId: 40, seq: 1 };

test('입주민 메시지의 사진만 보낸 순서대로 모은다', () => {
  const messages = [
    { senderType: 'RESIDENT', attachments: [first, second] },
    { senderType: 'ASSISTANT', attachments: [] },
    { senderType: 'RESIDENT', attachments: [third] },
  ];

  assert.deepEqual(residentPhotos(messages), [first, second, third]);
});

test('고른 사진이 없으면 첫 사진이 대표 사진이다', () => {
  assert.equal(representativePhotoId([first, second], null), 31);
});

test('고른 사진이 목록에 있으면 그 사진이 대표 사진이다', () => {
  assert.equal(representativePhotoId([first, second], 32), 32);
});

test('고른 사진이 목록에 없으면 첫 사진으로 돌아간다', () => {
  assert.equal(representativePhotoId([first, second], 99), 31);
});

test('사진이 없으면 대표 사진도 없다', () => {
  assert.equal(representativePhotoId([], null), null);
});
