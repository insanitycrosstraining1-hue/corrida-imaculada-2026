import {authorized,db,json} from '../../../../lib/server';
export async function GET(req){
 if(!authorized(req))return json({erro:'Não autorizado'},401);
 const {data,error}=await db().from('inscricoes').select('id,nome,email,telefone,nascimento,cidade,modalidade,kit,tamanho,valor,status,comprovante_path,comprovante_enviado_em,criado_em,pago_em').order('criado_em',{ascending:false}).limit(5000);
 if(error)return json({erro:'Erro ao listar'},500);return json({inscricoes:data});
}
export async function PATCH(req){
 if(!authorized(req))return json({erro:'Não autorizado'},401);
 const {id,status}=await req.json();
 if(!/^[0-9a-f-]{36}$/i.test(id||'')||!['pago','rejeitado','cancelado','em_analise','confirmado_comprovante'].includes(status))return json({erro:'Dados inválidos'},400);
 const database=db();const {data:row}=await database.from('inscricoes').select('status,comprovante_path').eq('id',id).maybeSingle();
 if(!row)return json({erro:'Não encontrada'},404);
 if(status==='pago'&&!row.comprovante_path)return json({erro:'Sem comprovante enviado'},409);
 const {error}=await database.from('inscricoes').update({status,pago_em:status==='pago'?new Date().toISOString():null,revisado_em:new Date().toISOString()}).eq('id',id);
 if(error)return json({erro:'Não foi possível atualizar'},500);return json({ok:true});
}
