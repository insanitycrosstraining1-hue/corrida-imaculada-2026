import {Suspense} from 'react';
import Consulta from './consulta';
export default function Page(){return <main className="wrap narrow"><a href="/">← Voltar ao início</a><h1>Consultar minha inscrição</h1><p>Informe seu número de inscrição para verificar o recebimento do comprovante e a situação do pagamento.</p><Suspense fallback={<p>Carregando...</p>}><Consulta/></Suspense></main>}
