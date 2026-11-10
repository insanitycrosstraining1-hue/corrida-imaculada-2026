import {json} from '../../../../lib/server';
export async function POST(){const r=json({ok:true});r.headers.append('Set-Cookie','admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return r}
