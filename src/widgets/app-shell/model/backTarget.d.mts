export type BackTarget = {
  path: string;
  preferHistory: boolean;
};

export function backTarget(pathname: string): BackTarget | null;
