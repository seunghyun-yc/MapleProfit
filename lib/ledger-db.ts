import {env} from 'cloudflare:workers';
export function ledgerDb(){if(!env.DB)throw Error('Storage unavailable');return env.DB;}
