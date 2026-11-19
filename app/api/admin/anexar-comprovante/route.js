import {notificarComprovante} from '../../../../lib/email';
import {authorized,db,json} from '../../../../lib/server';
import {randomUUID} from 'node:crypto';
export const runtime='nodejs';
export async function POST(req){
 if(!authorized(req))return json({erro:'Sessão expirada. Entre novamente no painel.'},401);
 try{
  const form=await req.formData();
  const id=String(form.get('id')||'').trim();
  const file=form.get('arquivo');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return json({erro:'Inscrição inválida.'},400);
  if(!file||typeof file.arrayBuffer!=='function')return json({erro:'Selecione um comprovante.'},400);
  const extensions={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};
  const ext=extensions[file.type];
  if(!ext||file.size<100||file.size>5*1024*1024)return json({erro:'Envie JPG, PNG, WEBP ou PDF de até 5 MB.'},400);
  const bytes=Buffer.from(await file.arrayBuffer());
  const signatureOk=ext==='pdf'?bytes.subarray(0,5).toString()==='%PDF-':ext==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):ext==='jpg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!signatureOk)return json({erro:'O conteúdo do arquivo não corresponde ao formato informado.'},400);
  const database=db();
  const {data:row,error:lookupError}=await database.from('inscricoes').select('id,status,comprovante_path,nome,email,modalidade,kit').eq('id',id).maybeSingle();
  if(lookupError)throw lookupError;
  if(!row)return json({erro:'Inscrição não encontrada.'},404);
  if(row.comprovante_path)return json({erro:'Esta inscrição já possui comprovante. Atualize a lista.'},409);
  if(['pago','cancelado'].includes(row.status))return json({erro:'Esta inscrição não aceita novos comprovantes.'},409);
  const path=`${id}/${randomUUID()}.${ext}`;
  const {error:uploadError}=await database.storage.from('comprovantes').upload(path,bytes,{contentType:file.type,upsert:false});
  if(uploadError)throw uploadError;
  const {data:updated,error:updateError}=await database.from('inscricoes').update({comprovante_path:path,comprovante_enviado_em:new Date().toISOString(),status:'confirmado_comprovante'}).eq('id',id).is('comprovante_path',null).in('status',['pendente','em_analise','rejeitado','confirmado_comprovante']).select('id').maybeSingle();
  if(updateError||!updated){await database.storage.from('comprovantes').remove([path]);return json({erro:'Não foi possível vincular o comprovante. Atualize a lista e tente novamente.'},409)}
  let emailEnviado=false;try{emailEnviado=await notificarComprovante(row)}catch(err){console.error('email_comprovante',err)}
  return json({ok:true,status:'confirmado_comprovante',emailEnviado});
 }catch(e){console.error('admin_anexar_comprovante',e);return json({erro:'Falha ao anexar o comprovante. Verifique os logs.'},500)}
}
