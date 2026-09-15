export const browserStorage = () => typeof window !== 'undefined' && Boolean((window as Window & { mapleBrowserStorage?: boolean }).mapleBrowserStorage);

function openLedger(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mapleprofit-ledger-v1', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('records', { keyPath: 'id' });
      request.result.createObjectStore('settings');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('다른 장부 탭을 닫고 다시 시도하세요.'));
  });
}

export async function ledgerRequest(options: RequestInit = {}): Promise<Response> {
  if (!browserStorage()) return fetch('/api/ledger', options);
  const db = await openLedger();
  try {
    const method = options.method || 'GET';
    const input = method === 'GET' ? null : JSON.parse(String(options.body));
    if (method !== 'GET' && (typeof input?.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(input.id))) throw new Error('잘못된 기록입니다.');
    if (method === 'POST') {
      const limits: Record<string, number> = { count: 10000, meso: 1e12, pieces: 1e6, price: 1e9, createdAt: Number.MAX_SAFE_INTEGER };
      if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Number.isFinite(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date || Object.entries(limits).some(([key, max]) => !Number.isSafeInteger(input[key]) || input[key] < 0 || input[key] > max)) throw new Error('날짜와 0 이상의 정수를 입력하세요.');
    }
    if (!['GET', 'POST', 'DELETE'].includes(method)) throw new Error('지원하지 않는 작업입니다.');
    return await new Promise<Response>((resolve, reject) => {
      const transaction = db.transaction(['records', 'settings'], method === 'GET' ? 'readonly' : 'readwrite');
      const records = transaction.objectStore('records');
      const settings = transaction.objectStore('settings');
      let entries: unknown[] = [];
      let price: number | null = null;
      if (method === 'GET') {
        records.getAll().onsuccess = event => { entries = (event.target as IDBRequest).result; };
        settings.get('price').onsuccess = event => { price = (event.target as IDBRequest).result ?? null; };
      } else if (method === 'POST') {
        records.put(input);
        settings.put(input.price, 'price');
      } else records.delete(input.id);
      transaction.oncomplete = () => resolve(Response.json(method === 'GET' ? { entries, price } : { ok: true }));
      transaction.onabort = () => reject(transaction.error || new Error('저장하지 못했습니다.'));
      transaction.onerror = () => reject(transaction.error || new Error('저장하지 못했습니다.'));
    });
  } finally { db.close(); }
}
