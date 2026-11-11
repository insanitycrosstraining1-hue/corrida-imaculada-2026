import {createClient} from '@supabase/supabase-js';
import {createHmac,timingSafeEqual} from 'node:crypto';

export function checkSupabaseConfig(){
  const rawUrl=process.env.SUPABASE_URL?.trim()||'';
  const rawKey=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()||'';
  let url='';
  try {
    const parsed=new URL(rawUrl);
    if(!['https:','http:'].includes(parsed.protocol)) throw new Error('protocol');
    url=parsed.origin;
  } catch {
    throw new Error('CONFIG_SUPABASE_URL_INVALIDA: confira SUPABASE_URL no ambiente deste deployment.');
  }
  if(!rawKey) {
    throw new Error('CONFIG_SUPABASE_KEY_AUSENTE: SUPABASE_SERVICE_ROLE_KEY não está disponível neste deployment.');
  }
  return {url,key:rawKey};
}
export const db=()=>{
  const {url,key}=checkSupabaseConfig();
  return createClient(url,key,{auth:{persistSession:false}});
};
export function sign(value){return createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('hex')}
export function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
export function authorized(req){const c=req.cookies.get('admin_session')?.value||'';return !!process.env.SESSION_SECRET&&equal(c,sign('imaculada-admin-v1'))}
export function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
