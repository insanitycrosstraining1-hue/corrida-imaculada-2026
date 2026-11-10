# Corrida e Caminhada da Imaculada — PIX com comprovante

Versão Next.js com inscrições, QR Code PIX estático da Diocese, envio privado de comprovantes, painel administrativo e conferência manual.

## Publicação
1. Crie um projeto Supabase e execute `schema.sql` no SQL Editor (inclui bucket privado `comprovantes`). Se já executou o schema da versão antiga, crie uma nova base ou faça uma migração segura, preservando inscrições existentes.
2. Configure as variáveis de `.env.example` na Vercel. **Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no navegador nem no Git.**
3. Faça deploy do projeto Next.js na Vercel, preferencialmente em ambiente de preview protegido, e teste inscrição, upload e revisão antes de divulgar.
4. Acesse `/admin` usando `ADMIN_PASSWORD` e confira cada pagamento no extrato do Banco do Brasil antes de selecionar **Confirmar pago**.
5. O comprovante é armazenado em bucket privado e o painel emite URL temporária de 60 segundos para leitura.

## Limitações e cuidados
- Não existe confirmação bancária automática. O status é alterado pelo administrador após conferência.
- O QR Code em `public/pix-original.jpeg` é o fornecido pela organização. **Antes de publicar, teste o QR Code e confirme no app do banco que o beneficiário é a Diocese e que aceita o valor correto.**
- A página de status consulta o identificador da inscrição; não compartilhe esse identificador publicamente.
- A autenticação por senha única é uma solução inicial. Para operação pública, adicione autenticação individual, MFA, rate limiting e trilha de auditoria; para envio de arquivos, adicione captcha, rate limiting, validação de conteúdo e proteção contra abuso.
- A organização deve publicar regulamento, aviso de privacidade/LGPD, política de cancelamento, regras para menores, percurso e retirada de kits antes de abrir inscrições.
- O site não envia mensagens automáticas de WhatsApp; disponibiliza link de contato.
- O painel lista até 5.000 inscrições; implemente paginação se ultrapassar esse limite.

## Confirmação automática por comprovante
Após upload válido e gravação no armazenamento privado, a inscrição muda para `confirmado_comprovante` e aparece como confirmada ao participante. Isso NÃO significa pagamento bancário verificado. No painel, o responsável pode marcar `pago` após conferir o extrato, rejeitar ou cancelar. Nunca contabilize `confirmado_comprovante` como receita liquidada.
