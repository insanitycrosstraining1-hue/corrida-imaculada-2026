import {createClient} from '@supabase/supabase-js';
import {createHmac,timingSafeEqual} from 'node:crypto';
export const db=()=>createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
export function sign(value){return createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('hex')}
export function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
export function authorized(req){const c=req.cookies.get('admin_session')?.value||'';return !!process.env.SESSION_SECRET&&equal(c,sign('imaculada-admin-v1'))}
export function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
