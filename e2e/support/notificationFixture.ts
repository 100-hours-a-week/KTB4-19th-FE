import { createServer, type ServerResponse } from 'node:http';

export function notificationRow(id: number, role = 'MANAGER', user = 1) {
  return {
    userNotiId: id,
    notificationId: id + 10000,
    content:
      role === 'MANAGER'
        ? {
            type: 'COMPLAINT_CREATED',
            complaintId: id + 20,
            buildingId: 7,
            title: `계정${user} 천장 누수 ${id}`,
            roomNo: '302',
            occurredAt: '2026-10-07T18:30:00+09:00',
          }
        : {
            type: 'COMPLAINT_STATUS_CHANGED',
            complaintId: id + 20,
            buildingId: 7,
            title: `계정${user} 천장 누수 ${id}`,
            statusCode: 'DONE',
            occurredAt: '2026-10-07T18:30:00+09:00',
          },
    readAt: null as string | null,
    createdAt: '2026-10-07T18:30:01+09:00',
  };
}
export async function createNotificationFixture() {
  const state = {
    role: 'MANAGER',
    user: 1,
    buildingId: 7 as number | null,
    hasRooms: true,
    residentConnected: true,
    streamStatus: 200,
    patchStatus: 200,
    refreshStatus: 200,
    queryStatus: 200,
    holdRefresh: false,
    holdMe: false,
    failOnboarding: false,
    holdOnboarding: false,
    rows: [notificationRow(7001)],
    secondRows: [notificationRow(8001, 'MANAGER', 2)],
    calls: [] as { path: string; method: string; user: number; body: string }[],
    streams: new Set<ServerResponse>(),
    maxStreams: 0,
    releaseOnboarding: () => {},
    releaseRefresh: () => {},
    releaseMe: () => {},
  };
  const server = createServer(async (request, response) => {
    const url = new URL(request.url!, 'http://fixture');
    const path = url.pathname.replace('/api/v1', '');
    const user = request.headers.authorization?.endsWith('fixture-2') ? 2 : 1;
    response.setHeader(
      'Access-Control-Allow-Origin',
      request.headers.origin ?? '*',
    );
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, Accept',
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, OPTIONS',
    );
    if (request.method === 'OPTIONS') {
      response.end();
      return;
    }
    let body = '';
    for await (const chunk of request) body += chunk;
    state.calls.push({ path, method: request.method!, user, body });
    const data = (value: unknown) => {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ data: value, error: null }));
    };
    const fail = (status: number) => {
      response.statusCode = status;
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          data: null,
          error: {
            code: status === 403 ? 'FORBIDDEN' : 'NOTIFICATION_NOT_FOUND',
          },
          message: 'Fixture failure',
        }),
      );
    };
    const authUser = (id: number) => ({
      userId: id,
      userRole: state.role,
      userName: `계정${id}`,
      email: `fixture${id}@example.com`,
      phone: '01012345678',
      buildingId: state.buildingId,
      roomId: state.residentConnected ? 3 : null,
    });
    if (path === '/auth/reissue') {
      if (state.holdRefresh)
        await new Promise<void>((resolve) => {
          state.releaseRefresh = resolve;
        });
      if (state.refreshStatus !== 200) return fail(state.refreshStatus);
      return data({
        accessToken: `fixture-${state.user}`,
        tokenType: 'Bearer',
      });
    }
    if (path === '/auth/login') {
      state.user = 2;
      return data({ accessToken: 'fixture-2', user: authUser(2) });
    }
    if (path === '/auth/logout') return data(null);
    if (path === '/users/me' && request.method === 'PATCH') {
      state.role = JSON.parse(body).userRole;
      return data({
        userId: user,
        userRole: state.role,
        accessToken: `fixture-${user}`,
        tokenType: 'Bearer',
      });
    }
    if (path === '/users/me') {
      if (user === 1 && state.holdMe)
        await new Promise<void>((resolve) => {
          state.releaseMe = resolve;
        });
      return data(authUser(user));
    }
    if (path === '/users/me/onboarding-status') {
      if (user === 2 && state.holdOnboarding)
        await new Promise<void>((resolve) => {
          state.releaseOnboarding = resolve;
        });
      if (user === 2 && state.failOnboarding) return fail(500);
      return data({
        userRole: state.role,
        buildingId: state.role === 'MANAGER' ? state.buildingId : null,
        hasRooms: state.hasRooms,
        residentConnected: state.residentConnected,
        nextStep:
          state.role === 'NONE'
            ? 'ROLE_SELECTION'
            : state.role === 'RESIDENT'
              ? state.residentConnected
                ? 'HOME'
                : 'INVITATION_CODE'
              : state.buildingId === null
                ? 'BUILDING_REGISTRATION'
                : state.hasRooms
                  ? 'HOME'
                  : 'ROOM_REGISTRATION',
      });
    }
    if (path === '/managers/me/building' && request.method === 'POST') {
      state.buildingId = 7;
      return data({ buildingId: 7, ...JSON.parse(body) });
    }
    if (path === '/managers/me/building/rooms' && request.method === 'POST') {
      const rooms = (JSON.parse(body).roomNos as string[]).map(
        (roomNo, index) => ({
          roomId: index + 1,
          roomNo,
          roomStatus: 'EMPTY',
        }),
      );
      state.hasRooms = true;
      return data({ buildingId: 7, createdCount: rooms.length, rooms });
    }
    if (path === '/residents/me/invitation-codes/ABC123')
      return data({ buildingName: 'Fixture', roomNo: '302' });
    if (path === '/residents/me/room' && request.method === 'PUT') {
      state.residentConnected = true;
      return data({ buildingName: 'Fixture', roomNo: '302' });
    }
    if (path.startsWith('/users/me/notifications')) {
      const eligible =
        state.role === 'MANAGER'
          ? state.buildingId !== null
          : state.role === 'RESIDENT' && state.residentConnected;
      if (!eligible) return fail(403);
    }
    if (path === '/users/me/notifications/stream') {
      if (state.streamStatus !== 200) return fail(state.streamStatus);
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.flushHeaders();
      response.write(':connected\r\n\r\n');
      state.streams.add(response);
      state.maxStreams = Math.max(state.maxStreams, state.streams.size);
      const heartbeat = setInterval(
        () => response.write(':heartbeat\n\n'),
        30_000,
      );
      response.on('close', () => {
        clearInterval(heartbeat);
        state.streams.delete(response);
      });
      return;
    }
    const rows = user === 2 ? state.secondRows : state.rows;
    if (path === '/users/me/notifications/unread-count')
      return state.queryStatus !== 200
        ? fail(state.queryStatus)
        : data({
            unreadCount: rows.filter((row) => row.readAt === null).length,
          });
    if (path === '/users/me/notifications') {
      if (state.queryStatus !== 200) return fail(state.queryStatus);
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 20);
      return data({
        totalCount: rows.length,
        page,
        pageSize: size,
        hasNext: (page + 1) * size < rows.length,
        notifications: rows.slice(page * size, (page + 1) * size),
      });
    }
    if (
      path.startsWith('/users/me/notifications/') &&
      request.method === 'PATCH'
    ) {
      if (state.patchStatus !== 200) return fail(state.patchStatus);
      if (body !== JSON.stringify({ isRead: true })) return fail(400);
      const row = rows.find(
        (row) => row.userNotiId === Number(path.split('/').slice(-1)[0]),
      );
      if (!row) return fail(404);
      row.readAt ??= '2026-10-07T19:00:00+09:00';
      return data({
        userNotiId: row.userNotiId,
        readAt: row.readAt,
        unreadCount: rows.filter((row) => row.readAt === null).length,
      });
    }
    if (request.method !== 'GET') return fail(405);
    if (path === '/residents/me/room')
      return data({
        roomId: 3,
        buildingId: 7,
        roomNo: '302',
        buildingName: 'Fixture',
      });
    if (path === '/managers/me/building')
      return data({
        buildingId: 7,
        buildingName: 'Fixture',
        roadAddress: '서울 테스트로',
        totalRoomCount: 1,
      });
    if (
      path === '/managers/me/complaints' ||
      path === '/residents/me/complaints'
    ) {
      if (path === '/residents/me/complaints' && !state.residentConnected)
        return fail(403);
      return data({
        totalCount: 0,
        complaints: [],
        page: 0,
        pageSize: 20,
        hasNext: false,
      });
    }
    if (path === '/managers/me' || path === '/residents/me')
      return data(authUser(user));
    return fail(404);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Fixture address unavailable');
  return {
    state,
    url: `http://127.0.0.1:${address.port}`,
    signal: (id = 7001) =>
      state.streams.forEach((stream) =>
        stream.write(
          `id: ${id}\nevent: notification\ndata: {"message":"success","data":{"userNotiId":${id}}}\n\n`,
        ),
      ),
    disconnect: () => state.streams.forEach((stream) => stream.end()),
    close: () => {
      state.streams.forEach((stream) => stream.destroy());
      server.closeAllConnections();
      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
