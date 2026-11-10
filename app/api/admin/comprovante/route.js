import {authorized,db,json} from '../../../../lib/server';
export async function GET(req){
 if(!authorized(req))return json({erro:'Não autorizado'},401);
 const id=new URL(req.url).searchParams.get('id');if(!/^[0-9a-f-]{36}$/i.test(id||''))return json({erro:'ID inválido'},400);
 const database=db();const {data}=await database.from('inscricoes').select('comprovante_path').eq('id',id).maybeSingle();
 if(!data?.comprovante_path)return json({erro:'Sem comprovante'},404);
 const {data:signed,error}=await database.storage.from('comprovantes').createSignedUrl(data.comprovante_path,60);
 if(error)return json({erro:'Falha ao acessar comprovante'},500);return json({url:signed.signedUrl});
}
