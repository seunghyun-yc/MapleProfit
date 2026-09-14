import './sites-env.mjs';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
const args=process.argv.slice(2);
const setupOnly=args.includes('--setup-only');
const portArg=args.find(a=>a.startsWith('--port='));
const port=portArg?Number(portArg.slice(7)):8787;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('포트는 1024~65535 정수여야 합니다.');
let child;
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;child?.kill(signal);});
async function run(script,arguments_=[],nonInteractive=false){
 await new Promise((resolve,reject)=>{
  child=spawn(process.execPath,['--import',pathToFileURL(path.join(root,'scripts/sites-env.mjs')).href,script,...arguments_],{cwd:root,stdio:nonInteractive?['ignore','inherit','inherit']:'inherit',env:nonInteractive?{...process.env,CI:'true'}:process.env});
  child.once('error',reject);
  child.once('exit',(code,signal)=>code===0?resolve():reject(new Error(stopping?'종료했습니다.':`실행 실패 (${code??signal})`)));
 });
}
try{
 console.log('\n메이플 사냥장부를 준비합니다. 기록은 이 컴퓨터에만 저장됩니다.\n');
 await run(path.join(root,'scripts/run-framework.mjs'),['build']);
 const config=JSON.parse(await readFile(path.join(root,'dist/server/wrangler.json'),'utf8'));
 const db=config.d1_databases?.find(db=>db.binding==='DB');
 if(!db)throw Error('로컬 저장소 설정을 찾지 못했습니다.');
 await mkdir(path.join(root,'.sites-runtime'),{recursive:true});
 const migrationConfig=path.join(root,'.sites-runtime/local-db.json');
 await writeFile(migrationConfig,JSON.stringify({name:'maple-ledger-local',compatibility_date:'2026-05-15',d1_databases:[{...db,migrations_dir:path.join(root,'drizzle')}]}));
 const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
 await run(wrangler,['d1','migrations','apply','DB','--local','--config',migrationConfig,'--persist-to',path.join(root,'.wrangler/state')],true);
 if(!setupOnly){
  console.log(`\n브라우저에서 http://127.0.0.1:${port} 를 여세요. 종료: Ctrl+C\n`);
  await run(wrangler,['dev','--local','--config',path.join(root,'dist/server/wrangler.json'),'--persist-to',path.join(root,'.wrangler/state'),'--ip','127.0.0.1','--port',String(port),'--inspector-port','0']);
 }
}catch(e){if(!stopping){console.error(e.message);process.exitCode=1;}}
