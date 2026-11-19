'use client';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
export default function Consulta(){
 const params=useSearchParams();
 const [id,setId]=useState(params.get('id')||'');
 const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[loading,setLoading]=useState(false);
 async function buscar(valor){
  setLoading(true);setErro('');setDados(null);
  try{
   const r=await fetch('/api/status?id='+encodeURIComponent(valor),{cache:'no-store'});
   const j=await r.json();if(!r.ok)throw Error(j.erro||'Não foi possível consultar.');
   setDados(j);
  }catch(e){setErro(e.message)}finally{setLoading(false)}
 }
 useEffect(()=>{const inicial=params.get('id');if(inicial)buscar(inicial)},[params]);
 const estado=dados?.status==='pago'?'Pagamento confirmado pela organização':dados?.status==='confirmado_comprovante'?'Comprovante recebido; aguardando conferência bancária':dados?.status==='em_analise'?'Pagamento em análise':dados?.status==='rejeitado'?'Comprovante rejeitado — contate a organização':dados?.status==='cancelado'?'Inscrição cancelada':'Aguardando comprovante PIX';
 const link=dados?'https://wa.me/?text='+encodeURIComponent('1ª Corrida e Caminhada da Imaculada — 06/12/2026\nInscrição: '+dados.id+'\nSituação: '+estado+'\nConsulte: https://corrida-imaculada-2026.vercel.app/consulta?id='+dados.id):'';
 return <section className="card form">
  <form onSubmit={e=>{e.preventDefault();buscar(id.trim())}}>
   <label>Número da inscrição<input value={id} onChange={e=>setId(e.target.value)} placeholder="Cole o número da sua inscrição" required/></label>
   <button disabled={loading}>{loading?'Consultando...':'CONSULTAR INSCRIÇÃO'}</button>
  </form>
  {erro&&<p className="error">{erro}</p>}
  {dados&&<div><h2>Situação da inscrição</h2><p><strong>{estado}</strong></p><p>Número: <code>{dados.id}</code></p><p>Modalidade: {dados.modalidade}</p><p>Kit: {dados.kit==='completo'?'Camisa + medalha':'Medalha sem camisa'}</p><p>Valor: R$ {Number(dados.valor).toFixed(2).replace('.',',')}</p><p className="muted">O recebimento do comprovante não equivale à confirmação do pagamento no banco.</p><p><a className="button" href={link} target="_blank" rel="noreferrer">COMPARTILHAR PELO WHATSAPP</a></p></div>}
  <p><a href="https://wa.me/5594991356704" target="_blank" rel="noreferrer">Precisa de ajuda? Fale com a organização</a></p>
 </section>
}
