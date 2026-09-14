export type RoomStatus = "EMPTY" | "INVITED" | "LIVING";
export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export type ViewState = "default" | "loading" | "empty" | "error";

export const rooms = [
  { id: 301, roomNo: "301호", status: "LIVING" as const, resident: "이입주", complaints: 2 },
  { id: 302, roomNo: "302호", status: "LIVING" as const, resident: "박입주", complaints: 3 },
  { id: 303, roomNo: "303호", status: "INVITED" as const, resident: null, complaints: 0 },
  { id: 304, roomNo: "304호", status: "EMPTY" as const, resident: null, complaints: 0 },
  { id: 201, roomNo: "201호", status: "LIVING" as const, resident: "김주민", complaints: 1 },
  { id: 202, roomNo: "202호", status: "EMPTY" as const, resident: null, complaints: 0 },
];

export const complaints = [
  { id: 77, roomNo: "302호", title: "천장 누수", status: "IN_PROGRESS" as const, urgency: 9, date: "오늘 09:20", image: true },
  { id: 76, roomNo: "103호", title: "화장실 곰팡이", status: "PENDING" as const, urgency: 8, date: "어제 18:42", image: false },
  { id: 75, roomNo: "201호", title: "공용 현관 조명이 꺼졌어요", status: "DONE" as const, urgency: 3, date: "9월 11일", image: true },
];

export const conversations = [
  { id: 31, title: "천장에서 물이 새요", type: "민원", status: "처리중", time: "오늘 09:20" },
  { id: 30, title: "분리수거 요일이 언제인가요", type: "생활 문의", status: "답변완료", time: "어제 18:02" },
  { id: 29, title: "주차 등록 방법을 알려주세요", type: "생활 문의", status: "답변완료", time: "9월 10일" },
];

export const documents = [
  { id: 42, title: "건물 운영 규칙(소음)", version: 2, updatedAt: "오늘 10:12", size: "2.4 MB" },
  { id: 39, title: "공용 시설 이용 규칙", version: 1, updatedAt: "9월 8일", size: "1.1 MB" },
  { id: 32, title: "입실 및 퇴실 규칙", version: 1, updatedAt: "8월 29일", size: "864 KB" },
];

export const notifications = [
  { id: 1, unread: true, title: "신규 민원이 접수됐어요", body: "302호 · 천장 누수", time: "5분 전" },
  { id: 2, unread: true, title: "민원 상태가 변경됐어요", body: "공용 현관 조명 · 처리완료", time: "1시간 전" },
  { id: 3, unread: false, title: "초대코드가 사용됐어요", body: "302호에 박입주 님이 연결됐어요", time: "어제" },
];

export const insights = [
  { id: 101, category: "지금 대응 필요", title: "3층 누수 민원이 빠르게 늘고 있어요", cause: "같은 배관 라인에서 24시간 내 3건이 접수됐어요.", urgency: 9, count: 3 },
  { id: 102, category: "반복되는 문제", title: "공용 현관 조명 고장이 반복돼요", cause: "최근 30일간 같은 위치에서 4건이 접수됐어요.", urgency: 6, count: 4 },
];
