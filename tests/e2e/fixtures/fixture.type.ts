export interface TestLogin {
  username: string;
  type: 'admin' | 'company' | 'debitor';
  password?: string;
  slug?: string;
}

export interface BrowserLogin extends TestLogin {
  companyName?: string;
}
