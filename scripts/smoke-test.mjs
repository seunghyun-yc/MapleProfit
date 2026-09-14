import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8787';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('로컬 주소에서만 시험할 수 있습니다.');
const url=new URL('/api/ledger',base);
const send=async(method,body,headers={})=>{const response=await fetch(url,{method,headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const bodyText=await response.text();if(response.status>=500)console.error(bodyText);return response;};
const item={id:crypto.randomUUID(),date:'2026-09-14',count:2,meso:10000000,pieces:10,price:5000000};
try{
 const page=await fetch(base);assert.equal(page.status,200);await page.arrayBuffer();
 assert.equal((await send('POST',item)).status,200);
 assert.equal((await send('POST',item)).status,200);
 let data=await (await fetch(url)).json();
 assert.equal(data.entries.filter(e=>e.id===item.id).length,1);
 const row=data.entries.find(e=>e.id===item.id);
 assert.equal(row.meso+row.pieces*row.price,60000000);
 assert.equal((await send('POST',{...item,meso:-1})).status,400);
 assert.equal((await send('POST',{...item,date:'2026-02-30'})).status,400);
 assert.equal((await send('POST',item,{Origin:'https://example.invalid'})).status,403);
 assert.equal((await send('POST',{...item,pieces:12})).status,200);
 data=await (await fetch(url)).json();assert.equal(data.entries.find(e=>e.id===item.id).pieces,12);
 console.log('PASS: page, storage, calculation, duplicate prevention, editing, validation, origin checks');
}finally{
 assert.equal((await send('DELETE',{id:item.id})).status,200);
 console.log('PASS: test record removed');
}
console.log('Note: this test updates the default fragment price to 5,000,000 meso. Run on a disposable local copy.');

