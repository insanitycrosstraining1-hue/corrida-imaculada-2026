import {db,json} from '../../../lib/server';
export const runtime='nodejs';
export async function POST(req){
 try{
  const form=await req.formData(),id=String(form.get('id')||''),file=form.get('arquivo');
  if(!/^[0-9a-f-]{36}$/i.test(id)||!file||typeof file.arrayBuffer!=='function')return json({erro:'Inscrição ou arquivo inválido.'},400);
  const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};
  if(!types[file.type]||file.size<100||file.size>5*1024*1024)return json({erro:'Envie JPG, PNG, WEBP ou PDF com até 5 MB.'},400);
  const database=db();const {data:row,error}=await database.from('inscricoes').select('id,status,comprovante_path,nome,email,modalidade,kit').eq('id',id).maybeSingle();
  if(error)throw error;
  if(!row)return json({erro:'Inscrição não encontrada.'},404);
  if(row.comprovante_path)return json({erro:'Esta inscrição já possui comprovante.'},409);
  if(row.status==='pago'||row.status==='cancelado')return json({erro:'Esta inscrição não aceita novos comprovantes.'},409);
  const path=`${id}/${crypto.randomUUID()}.${types[file.type]}`;
  const bytes=Buffer.from(await file.arrayBuffer());
  const {error:uploadError}=await database.storage.from('comprovantes').upload(path,bytes,{contentType:file.type,upsert:false});
  if(uploadError){console.error(uploadError);return json({erro:'Falha ao salvar comprovante.'},500)}
  const {data:updated,error:updateError}=await database.from('inscricoes').update({comprovante_path:path,comprovante_enviado_em:new Date().toISOString(),status:'confirmado_comprovante'}).eq('id',id).is('comprovante_path',null).in('status',['pendente','em_analise','rejeitado']).select('id').maybeSingle();
  if(updateError||!updated){await database.storage.from('comprovantes').remove([path]);return json({erro:'Não foi possível vincular o comprovante. Atualize a página e tente novamente.'},409)}
  
  return json({ok:true,status:'confirmado_comprovante',});
 }catch(e){console.error('comprovante',e);return json({erro:'Erro no envio.'},500)}
}
