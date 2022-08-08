export type Role = 'admin';

export interface UserEditable {
  givenName?: string;
}
export interface UserFixed {
  email: string;
  id: string;
  iss: string;
  name: string;
  roles?: Array<Role>;
  createdAt: Date;
  updatedAt: Date;
}

export type User = UserEditable & UserFixed;
