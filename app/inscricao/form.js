'use client';
import {useEffect,useState,useRef} from 'react';
import {useSearchParams} from 'next/navigation';
export default function Formulario(){
 const formRef=useRef(null),[draft,setDraft]=useState(null),[copiado,setCopiado]=useState(false);
 const params=useSearchParams(),[kit,setKit]=useState('essencial'),[result,setResult]=useState(null),[loading,setLoading]=useState(false),[erro,setErro]=useState(''),[status,setStatus]=useState('pendente'),[file,setFile]=useState(null);
 useEffect(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('imaculada_inscricao_v2')||'null');
   if(saved?.result?.id){setResult(saved.result);setStatus(saved.status||'pendente');}
   else if(saved?.draft){setDraft(saved.draft);setKit(saved.draft.kit||'essencial');}
   else if(params.get('kit')==='completo')setKit('completo');
  }catch{}
 },[params]);
 useEffect(()=>{
  if(!draft||!formRef.current||result)return;
  const f=formRef.current;
  Object.entries(draft).forEach(([name,value])=>{const el=f.elements.namedItem(name);if(el&&name!=='kit'&&name!=='aceite')el.value=value});
 },[draft,kit,result]);
 useEffect(()=>{
  if(!result?.id)return;
  try{localStorage.setItem('imaculada_inscricao_v2',JSON.stringify({result,status}))}catch{}
 },[result,status]);
 async function salvarRascunho(e){
  const f=e.currentTarget;
  const data=Object.fromEntries(new FormData(f));
  try{localStorage.setItem('imaculada_inscricao_v2',JSON.stringify({draft:data}))}catch{}
 }
 async function copiarCelular(){
  try{await navigator.clipboard.writeText('94991293485');setCopiado(true)}
  catch{setCopiado(false);window.prompt('Copie o número:', '94991293485')}
 }
 function novaInscricao(){if(!window.confirm('Iniciar outra inscrição? A inscrição anterior continuará registrada no sistema.'))return;try{localStorage.removeItem('imaculada_inscricao_v2')}catch{}setResult(null);setDraft(null);setStatus('pendente');setFile(null);setErro('');}

 useEffect(()=>{if(!result?.id)return;const t=setInterval(async()=>{try{const r=await fetch('/api/status?id='+encodeURIComponent(result.id));const j=await r.json();if(j.status)setStatus(j.status)}catch{}},12000);return()=>clearInterval(t)},[result]);
 async function submit(e){e.preventDefault();setLoading(true);setErro('');const data=Object.fromEntries(new FormData(e.currentTarget));data.aceite=true;try{const r=await fetch('/api/inscricoes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(j.erro||'Falha na inscrição');setResult(j);setStatus('pendente');try{localStorage.setItem('imaculada_inscricao_v2',JSON.stringify({result:j,status:'pendente'}))}catch{}}catch(e){setErro(e.message)}finally{setLoading(false)}}
 async function enviar(e){e.preventDefault();if(!file)return;setLoading(true);setErro('');try{const body=new FormData();body.append('id',result.id);body.append('arquivo',file);const r=await fetch('/api/comprovante',{method:'POST',body});const j=await r.json();if(!r.ok)throw Error(j.erro||'Erro no envio');setStatus('confirmado_comprovante');setFile(null)}catch(e){setErro(e.message)}finally{setLoading(false)}}
 return result?<section className="card payment"><h2>{status==='pago'?'Inscrição confirmada!':status==='confirmado_comprovante'?'Inscrição confirmada!':status==='em_analise'?'Comprovante em análise':status==='rejeitado'?'Comprovante não aprovado':'Pagamento PIX'}</h2><p>Guarde seu número de inscrição: <code>{result.id}</code></p><p>Valor: <strong>R$ {result.valor},00</strong></p><p className="muted">Pode sair para o aplicativo do banco e voltar depois: esta inscrição ficará salva neste navegador.</p>{status==='confirmado_comprovante'&&<p className="success">Sua inscrição está CONFIRMADA pelo envio do comprovante! A organização poderá conferir o pagamento posteriormente. Guarde seu número de inscrição.</p>}{status==='pago'?<p className="success">A organização conferiu o recebimento e confirmou sua inscrição!</p>:<><p>Faça o PIX pela chave celular acima. O QR Code abaixo é o arquivo anteriormente fornecido; use-o somente se os dados do destinatário corresponderem à chave PIX oficial.</p><div className="copy-number"><p><strong>Chave PIX (celular):</strong> (94) 99129-3485</p><button type="button" onClick={copiarCelular}>{copiado?'NÚMERO COPIADO ✓':'COPIAR CHAVE PIX'}</button><p className="muted">Use esta chave PIX para pagar pelo celular. Antes de confirmar a transferência, confira o nome do destinatário no aplicativo do banco.</p></div><img className="qr" src="/pix-original.jpeg" alt="QR Code PIX fornecido pela Diocese"/><p><strong>Importante:</strong> o envio do comprovante confirma sua inscrição no evento, mas não comprova a liquidação bancária. A organização poderá verificar o recebimento posteriormente.</p><form onSubmit={enviar}><label>Comprovante do pagamento (JPG, PNG, WEBP ou PDF, até 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} required/></label><button disabled={loading||!file}>{loading?'Enviando...':'ENVIAR COMPROVANTE'}</button></form>{status==='rejeitado'&&<p>Entre em contato com a organização ou envie um novo comprovante.</p>}</>}{erro&&<p className="error">{erro}</p>}<p><a href={'https://wa.me/5594991356704?text='+encodeURIComponent('Olá! Minha inscrição na Corrida da Imaculada é '+result.id)} target="_blank" rel="noreferrer">Falar com a organização no WhatsApp</a></p><button type="button" className="outline" onClick={novaInscricao}>Fazer outra inscrição</button></section>:<form ref={formRef} className="card form" onInput={salvarRascunho} onChange={salvarRascunho} onSubmit={submit}><div className="two"><label>Nome completo<input name="nome" required minLength={3} maxLength={160}/></label><label>E-mail<input name="email" type="email" required/></label><label>WhatsApp com DDD<input name="telefone" type="tel" required placeholder="(94) 99999-9999"/></label><label>Data de nascimento<input name="nascimento" type="date" required/></label><label>Cidade / UF<input name="cidade" required defaultValue="Conceição do Araguaia / PA"/></label><label>Modalidade<select name="modalidade" required><option>Corrida</option><option>Caminhada</option></select></label><label>Kit<select name="kit" value={kit} onChange={e=>setKit(e.target.value)}><option value="essencial">Medalha, sem camisa — R$ 50</option><option value="completo">Camisa + medalha — R$ 80</option></select></label>{kit==='completo'&&<label>Tamanho da camisa<select name="tamanho" required><option value="">Selecione</option>{['PP','P','M','G','GG','XG'].map(t=><option key={t}>{t}</option>)}</select></label>}</div><label className="check"><input type="checkbox" required/> Autorizo o tratamento dos meus dados para inscrição e comunicação sobre o evento.</label><p className="muted">1º lote: R$ {kit==='completo'?'80':'50'},00. Após o cadastro, pague por PIX e envie o comprovante.</p>{erro&&<p className="error">{erro}</p>}<button disabled={loading}>{loading?'Registrando...':'CONTINUAR PARA O PIX →'}</button></form>
}
