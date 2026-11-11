import {db,json} from '../../../lib/server';
export const runtime='nodejs';
export async function POST(req){
 try{
  const x=await req.json();
  const nome=String(x.nome||'').trim().slice(0,160),email=String(x.email||'').trim().toLowerCase().slice(0,200),telefone=String(x.telefone||'').replace(/\D/g,''),cidade=String(x.cidade||'').trim().slice(0,120);
  const kit=x.kit,modalidade=x.modalidade,tamanho=kit==='completo'?x.tamanho:null,nascimento=x.nascimento;
  if(nome.length<3||!/^\S+@\S+\.\S+$/.test(email)||telefone.length<10||telefone.length>13||cidade.length<2||!['Corrida','Caminhada'].includes(modalidade)||!['essencial','completo'].includes(kit)||!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)||nascimento>new Date().toISOString().slice(0,10)||(kit==='completo'&&!['PP','P','M','G','GG','XG'].includes(tamanho))||x.aceite!==true)return json({erro:'Confira os dados obrigatórios.'},400);
  const valor=kit==='completo'?80:50;
  const {data,error}=await db().from('inscricoes').insert({nome,email,telefone,nascimento,cidade,modalidade,kit,tamanho,valor}).select('id').single();
  if(error)throw error;
  return json({id:data.id,valor,status:'pendente'});
 }catch(e){console.error('inscricao',e);
  if(String(e?.message||'').startsWith('CONFIG_SUPABASE_')){
    return json({erro:'Configuração do servidor incompleta. Avise a organização.',codigo:e.message.split(':')[0]},503);
  }
  return json({erro:'Erro ao processar inscrição.'},500)}
}
