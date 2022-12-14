export type Role = 'admin';

interface Provider {
  sub: string;
  refreshToken: string;
}

export interface User {
  id: string;
  provider: Map<string, Provider>;
  email: string;
  givenName?: string;
  name: string;
  roles?: Array<Role>;
  createdAt: Date;
  updatedAt: Date;
}
