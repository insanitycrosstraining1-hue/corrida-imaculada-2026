import {Suspense} from 'react';
import Formulario from './form';
export default function Page(){return <main className="wrap narrow"><a href="/">← Voltar ao início</a><h1>Faça sua inscrição</h1><p>06 de dezembro de 2026 • Largada às 6h</p><Suspense fallback={<p>Carregando formulário...</p>}><Formulario/></Suspense></main>}
