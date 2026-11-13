import { employeeDocumentKinds } from '@credit/contracts';
import { type APIRequestContext, expect, test } from '@playwright/test';
import { loginHeaders } from '../../e2e/fixtures/login';

const password = process.env.SEED_PASSWORD;
async function login(
  request: APIRequestContext,
  username: string,
  type: 'admin' | 'company' | 'debitor' = 'company',
  slug = 'sintetis-satu',
) {
  return loginHeaders(request, { username, type, slug, password });
}
test('registration API rejects internal fields and isolates employee CRUD and document download', async ({
  request,
}) => {
  const company = await login(request, 'hrd_satu');
  const other = await login(request, 'hrd_dua', 'company', 'sintetis-dua');
  const reader = await login(request, 'admin_baca', 'admin', 'admin');
  const account = {
    namaLengkap: 'P05 API',
    username: `p05-api-${Date.now()}`,
    password: 'Secret123',
    slug: 'sintetis-satu',
  };
  expect(
    (
      await request.post('/api/debitor/register', {
        data: { ...account, userId: 900002 },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/debitor/register', {
        data: { ...account, slug: 'missing' },
      })
    ).status(),
  ).toBe(404);
  const response = await request.post('/api/debitor/register', {
    data: account,
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  const signedIn = await request.post('/api/login', {
    data: { ...account, type: 'debitor' },
  });
  expect(signedIn.status()).toBe(200);
  const self = { Authorization: `Bearer ${(await signedIn.json()).authToken}` };
  try {
    expect((await request.get('/api/debitor/list')).status()).toBe(401);
    expect(
      (await request.post('/api/debitor/register', { data: account })).status(),
    ).toBe(409);
    expect(
      (
        await request.get(`/api/debitor/detail?id=${id}`, { headers: other })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get('/api/debitor/detail?id=900002', { headers: self })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/debitor/update', {
          headers: reader,
          data: { id, namaLengkap: 'Denied', username: account.username },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/debitor/delete', {
          headers: self,
          data: { id },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get('/api/debitor/list?userId=900002', { headers: self })
      ).status(),
    ).toBe(403);
    const detail = await (
      await request.get(`/api/debitor/detail?id=${id}`, { headers: self })
    ).json();
    expect(detail.password).toBeUndefined();
    const listing = await (
      await request.get('/api/debitor/list', { headers: self })
    ).json();
    expect(listing.data.map((row: { id: number }) => row.id)).toEqual([id]);
    expect(
      (
        await request.put('/api/debitor/profile', {
          headers: self,
          data: { id, profile: {} },
        })
      ).status(),
    ).toBe(400);
    const docs = Object.fromEntries(
      employeeDocumentKinds.slice(0, 5).map((kind) => [
        kind,
        {
          name: `${kind}.pdf`,
          mimeType: 'application/pdf',
          buffer: Buffer.from(`%PDF-1.4 ${kind}`),
        },
      ]),
    );
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: {
            id: String(id),
            fotoUrl: {
              name: 'foto.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('%PDF-1.4 foto'),
            },
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: {
            id: String(id),
            ...docs,
            fotoUrl: {
              name: 'fake.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('not a PDF'),
            },
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await request.post('/api/debitor/documents', {
          headers: self,
          multipart: { id: String(id), ...docs },
        })
      ).status(),
    ).toBe(200);
    const download = await request.get(
      `/api/debitor/document?id=${id}&kind=slipGajiUrl`,
      { headers: self },
    );
    expect(download.status()).toBe(200);
    expect(await download.text()).toContain('slipGajiUrl');
    expect(
      (
        await request.get(`/api/debitor/document?id=${id}&kind=slipGajiUrl`, {
          headers: other,
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get(`/api/debitor/document?id=${id}&kind=slipGajiUrl`)
      ).status(),
    ).toBe(401);
    expect(
      (
        await request.get('/api/debitor/export?format=xlsx&namaLengkap=P05', {
          headers: company,
        })
      ).status(),
    ).toBe(200);
    const otherList = await (
      await request.get('/api/debitor/list?namaLengkap=P05', { headers: other })
    ).json();
    expect(otherList.data).toEqual([]);
  } finally {
    expect(
      (
        await request.put('/api/debitor/delete', {
          headers: company,
          data: { id },
        })
      ).status(),
    ).toBe(200);
  }
});
