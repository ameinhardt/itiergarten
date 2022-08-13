export type Role = 'admin';

export interface UserEditable {
  givenName?: string;
}
export interface UserFixed {
  id: string;
  provider: Array<string>;
  email: string;
  name: string;
  roles?: Array<Role>;
  createdAt: Date;
  updatedAt: Date;
}

export type User = UserEditable & UserFixed;
