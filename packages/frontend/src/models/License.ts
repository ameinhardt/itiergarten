interface Author {
  name: string;
  email?: string;
}

export interface License {
  name: string;
  version: string;
  author: string | Author;
  license: string;
  licenseText: string | null;
  repository: string | null;
  description: string | null;
}
