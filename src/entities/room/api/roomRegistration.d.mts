export function isRoomCountValid(floorCount: number | string, roomsPerFloor: number | string): boolean;
export function generateRoomNumbers(floorCount: number | string, roomsPerFloor: number | string): string[];
export function selectedRoomNumbers(roomNumbers: string[], selectedNumbers: Set<string>): string[];
export function groupRoomNumbersByFloor(roomNumbers: string[]): Array<{ floor: number; roomNumbers: string[] }>;
