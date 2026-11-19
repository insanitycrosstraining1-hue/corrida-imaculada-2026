// Envio de notificações transacionais. Configure RESEND_API_KEY e EMAIL_FROM na Vercel.
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function notificarComprovante({nome,email,modalidade,kit,id}){
 const apiKey=process.env.RESEND_API_KEY?.trim();
 const from=process.env.EMAIL_FROM?.trim();
 if(!apiKey||!from){console.warn('EMAIL_NAO_CONFIGURADO: configure RESEND_API_KEY e EMAIL_FROM');return false}
 const assunto='Corrida da Imaculada — comprovante recebido';
 const texto=`Olá, ${nome}!\n\nRecebemos o comprovante PIX da sua inscrição na 1ª Corrida e Caminhada da Imaculada.\nModalidade: ${modalidade}\nKit: ${kit==='completo'?'Camisa + medalha':'Medalha (sem camisa)'}\nNúmero da inscrição: ${id}\n\nAtenção: o recebimento do comprovante NÃO significa que o pagamento foi confirmado no banco. A organização fará a conferência.\n\nData do evento: 06/12/2026, às 6h.\nOrganização da Corrida da Imaculada.`;
 const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:assunto,text,html:`<p>Olá, <strong>${esc(nome)}</strong>!</p><p>Recebemos o comprovante PIX da sua inscrição na <strong>1ª Corrida e Caminhada da Imaculada</strong>.</p><p>Modalidade: ${esc(modalidade)}<br/>Kit: ${kit==='completo'?'Camisa + medalha':'Medalha (sem camisa)'}<br/>Número da inscrição: ${esc(id)}</p><p><strong>O pagamento ainda será conferido pela organização no banco.</strong></p><p>Evento: 06/12/2026, às 6h.</p>`})});
 if(!res.ok){console.error('EMAIL_FALHOU',res.status,(await res.text()).slice(0,300));return false}
 return true;
}
