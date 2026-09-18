import { Documento } from '../types/document';
import { NivelAcesso } from '../types/auth';

export const INITIAL_DOCUMENTS: Documento[] = [
  {
    id: 'doc-001',
    codigo: 'REL-2026-001',
    titulo: 'Operação Eclipse: Neutralização de Ameaça Cibernética',
    subtitulo: 'Dossiê tático sobre contenção de intrusão coordenada em infraestrutura crítica',
    nivelAcesso: NivelAcesso.ULTRASSECRETO,
    departamento: 'Divisão de Operações Especiais & Defesa',
    autor: 'Gen. Rodrigo Saldanha',
    cargoAutor: 'Comandante de Ciberdefesa',
    dataCriacao: '2026-08-14',
    ultimaAtualizacao: '2026-08-24',
    status: 'ATIVO',
    paginas: 28,
    tamanho: '14.2 MB',
    tags: ['Cibersegurança', 'Ameaça Persistente', 'Infraestrutura Crítica', 'Contramedidas'],
    protocoloSeguranca: 'PROT-ALPHA-992-SEC',
    resumo: 'Relatório ultrassecreto detalhando as medidas de contra-inteligência adotadas durante a Operação Eclipse para conter invasão direcionada aos clusters de dados nacionais.',
    conteudo: `CLASSIFIED DOCUMENT // EYES ONLY // LEVEL 5 SECURITY CLEARANCE
═══════════════════════════════════════════════════════════════════
REGISTRO OFICIAL DE OPERAÇÃO: REL-2026-001
CÓDIGO OPERACIONAL: OPERAÇÃO ECLIPSE
CLASSIFICAÇÃO: ULTRASSECRETO (NÍVEL 5)
PROTOCOLO: SEC-ALPHA-2026-X9

1. RESUMO EXECUTIVO DA INCURSÃO
Nas primeiras horas do dia 12 de agosto de 2026, os sensores perimetrais do Sistema Integrado detectaram anomalias criptográficas compatíveis com o vetor de ataque do consórcio APT-39. 
Foi ativado o protocolo de isolamento de nó primário em menos de 180 segundos.

2. CONTRAMEDIDAS EXECUTADAS
- Desconexão física dos barramentos de fibra óptica da zona Delta.
- Re-criptografia com algoritmo pós-quântico Kyber-1024 de todos os cofres de senhas governamentais.
- Honeypot tático implantado na sub-rede 10.240.88.0/24 capturou 4.8 GB de telemetria do invasor.

3. RECONHECIMENTO DE DANOS
- Nenhuma chave mestra ou documento central sofreu exfiltração.
- O vetor de acesso inicial foi identificado como uma credencial comprometida de terceiro prestador de serviços em firewall periférico.

4. DIRETRIZES IMEDIATAS
- Todos os terminais de comando foram resetados para imagens bare-metal seguras.
- Suspensão imediata de acessos remotos via VPN não tokenizada por biometria de hardware.

AVISO DE SEGURANÇA NACIONAL:
A divulgação, cópia ou distribuição desautorizada deste documento constitui crime contra a segurança da informação com penalidades máximas previstas em lei.`,
    historicoAcesso: [
      { id: 'h-1', data: '2026-08-26 16:12', usuario: 'admin (Dr. Arthur Vance)', cargo: 'Diretor', nivel: NivelAcesso.ULTRASSECRETO, acao: 'Auditoria e assinatura digital' },
      { id: 'h-2', data: '2026-08-25 09:30', usuario: 'admin (Dr. Arthur Vance)', cargo: 'Diretor', nivel: NivelAcesso.ULTRASSECRETO, acao: 'Revisão tática' },
    ],
  },
  {
    id: 'doc-002',
    codigo: 'INT-2026-073',
    titulo: 'Relatório de Inteligência: Avaliação de Riscos Geopolíticos e Infraestrutura',
    subtitulo: 'Análise prospectiva do impacto de sanções e rotas logísticas no fornecimento de semicondutores',
    nivelAcesso: NivelAcesso.SECRETO,
    departamento: 'Análise Estratégica & Inteligência Externa',
    autor: 'Capitã Elena Ramos',
    cargoAutor: 'Oficial de Inteligência',
    dataCriacao: '2026-08-10',
    ultimaAtualizacao: '2026-08-22',
    status: 'ATIVO',
    paginas: 19,
    tamanho: '8.7 MB',
    tags: ['Inteligência', 'Semicondutores', 'Geopolítica', 'Cadeia de Suprimentos'],
    protocoloSeguranca: 'PROT-BETA-411-INT',
    resumo: 'Avaliação detalhada de vulnerabilidades em cadeias de suprimentos e riscos de dependência tecnológica em componentes de missão crítica para os próximos 24 meses.',
    conteudo: `CLASSIFIED INTELLIGENCE REPORT // LEVEL 4 CLEARANCE
═══════════════════════════════════════════════════════════════════
DOC ID: INT-2026-073
ASSUNTO: AVALIAÇÃO DE RISCOS GEOPOLÍTICOS EM CADEIAS TECNOLÓGICAS
CLASSIFICAÇÃO: SECRETO (NÍVEL 4)

1. PANORAMA GLOBAL
O estrangulamento na produção de pastilhas de silício de 3nm e 2nm em centros fabris do Sudeste Asiático eleva a probabilidade de escassez em 64% até o Q1 de 2027.

2. RECOMENDAÇÕES PARA ESTOQUE ESTRATÉGICO
- Aquisição antecipada de componentes redundantes para os centros de dados autônomos.
- Parcerias bilaterais de reserva com fabricantes europeus e do continente americano.

3. VETORES DE INTERFERÊNCIA
Identificamos movimentações de espionagem industrial direcionadas a fornecedores de maquinário litográfico de alta precisão.

STATUS: MONITORAMENTO CONTÍNUO.`,
    historicoAcesso: [
      { id: 'h-3', data: '2026-08-26 15:45', usuario: 'admin (Dr. Arthur Vance)', cargo: 'Diretor', nivel: NivelAcesso.ULTRASSECRETO, acao: 'Consulta' },
      { id: 'h-4', data: '2026-08-24 11:20', usuario: 'agente (Elena Ramos)', cargo: 'Oficial', nivel: NivelAcesso.SECRETO, acao: 'Atualização de métricas' },
    ],
  },
  {
    id: 'doc-003',
    codigo: 'FIN-2026-042',
    titulo: 'Relatório Financeiro Q3: Alocação Orçamentária e Auditoria',
    subtitulo: 'Demonstrativo confidencial de investimentos em cibersegurança e aquisições',
    nivelAcesso: NivelAcesso.CONFIDENCIAL,
    departamento: 'Controladoria & Compliance',
    autor: 'Lucas Mendonça',
    cargoAutor: 'Analista Financeiro Sênior',
    dataCriacao: '2026-07-28',
    ultimaAtualizacao: '2026-08-18',
    status: 'ATIVO',
    paginas: 44,
    tamanho: '5.4 MB',
    tags: ['Finanças', 'Orçamento', 'Auditoria', 'Compliance'],
    protocoloSeguranca: 'PROT-GAMMA-804-FIN',
    resumo: 'Balanço financeiro confidencial com distribuição de verbas sigilosas, auditoria contábil independente e projeções para o exercício fiscal vigente.',
    conteudo: `CONFIDENTIAL REPORT // NÍVEL 3 - CONFIDENCIAL
═══════════════════════════════════════════════════════════════════
DOC ID: FIN-2026-042
TEMA: DEMONSTRATIVO FINANCEIRO E AUDITORIA ORÇAMENTÁRIA Q3-2026

1. RECEITAS E DOTAÇÕES
- Total alocado para infraestrutura e resiliência: R$ 42.500.000,00
- Execução orçamentária até agosto: 68.4%
- Superávit de contingência preservado: R$ 8.200.000,00

2. PROJETOS FINANCIADOS
- Modernização do Data Center Blindado: R$ 18.300.000,00
- Contratação de testes de intrusão Red Team: R$ 2.400.000,00
- Expansão da rede de comunicações cifradas: R$ 11.100.000,00

3. PARECER DA AUDITORIA
Auditoria interna realizada em conformidade com as normas SOX e LGPD/GDPR. Nenhum desvio de conduta identificado nos processos licitatórios.`,
    historicoAcesso: [
      { id: 'h-5', data: '2026-08-26 14:10', usuario: 'analista (Lucas Mendonça)', cargo: 'Analista', nivel: NivelAcesso.CONFIDENCIAL, acao: 'Exportação de relatórios' },
      { id: 'h-6', data: '2026-08-20 10:00', usuario: 'admin (Dr. Arthur Vance)', cargo: 'Diretor', nivel: NivelAcesso.ULTRASSECRETO, acao: 'Aprovação' },
    ],
  },
  {
    id: 'doc-004',
    codigo: 'DOC-2026-018',
    titulo: 'Manual de Procedimentos Internos e Resposta a Incidentes',
    subtitulo: 'Guia obrigatório de conduta, autenticação multifator e manipulação de mídias',
    nivelAcesso: NivelAcesso.INTERNO,
    departamento: 'Recursos Humanos & TI',
    autor: 'Mariana Duarte',
    cargoAutor: 'Assistente Administrativa',
    dataCriacao: '2026-06-05',
    ultimaAtualizacao: '2026-08-01',
    status: 'ATIVO',
    paginas: 15,
    tamanho: '2.1 MB',
    tags: ['Procedimentos', 'MFA', 'Treinamento', 'Boas Práticas'],
    protocoloSeguranca: 'PROT-DELTA-102-INT',
    resumo: 'Manual de instrução para todos os membros da equipe contendo padrões de criação de senhas seguras, política de mesa limpa e fluxo de comunicação de incidentes.',
    conteudo: `INTERNAL DOCUMENTATION // NÍVEL 2 - INTERNO
═══════════════════════════════════════════════════════════════════
DOC ID: DOC-2026-018
MANUAL DE CONDUTA E SEGURANÇA DA INFORMAÇÃO INTERNA

1. POLÍTICA DE DISPOSITIVOS E CREDENCIAIS
- Senhas devem conter no mínimo 16 caracteres com complexidade obrigatória.
- Proibida a conexão de dispositivos USB desconhecidos nos terminais da rede local.
- Troca periódica obrigatória a cada 60 dias.

2. FLUXO DE COMUNICAÇÃO DE PHISHING
Caso receba e-mail suspeito com anexos não solicitados ou links encurtados, acione imediatamente o botão "Denunciar Phishing" ou ligue para o ramal 4040.

3. POLÍTICA DE MESA LIMPA
Ao se ausentar de sua estação de trabalho, o usuário DEVE bloquear a tela do computador (Win + L) e guardar documentos físicos sob chave.`,
    historicoAcesso: [
      { id: 'h-7', data: '2026-08-26 11:15', usuario: 'usuario (Mariana Duarte)', cargo: 'Assistente', nivel: NivelAcesso.INTERNO, acao: 'Consulta' },
    ],
  },
  {
    id: 'doc-005',
    codigo: 'COM-2026-005',
    titulo: 'Comunicado Institucional: Política de Transparência e Governança',
    subtitulo: 'Declaração pública de conformidade e compromisso com proteção de dados',
    nivelAcesso: NivelAcesso.PUBLICO,
    departamento: 'Comunicação Social & Relações Públicas',
    autor: 'Assessoria de Imprensa',
    cargoAutor: 'Comunicação Corporativa',
    dataCriacao: '2026-05-12',
    ultimaAtualizacao: '2026-07-15',
    status: 'ATIVO',
    paginas: 6,
    tamanho: '1.1 MB',
    tags: ['Institucional', 'Público', 'Governança', 'Transparência'],
    protocoloSeguranca: 'PROT-PUB-001',
    resumo: 'Documento de divulgação pública que detalha os pilares éticos da instituição, certificações ISO 27001 obtidas e canais oficiais de atendimento ao cidadão.',
    conteudo: `PUBLIC ANNOUNCEMENT // NÍVEL 1 - PÚBLICO
═══════════════════════════════════════════════════════════════════
DOC ID: COM-2026-005
COMUNICADO PÚBLICO DE GOVERNANÇA E PRIVACIDADE

A Instituição CLASSIFIED reafirma seu compromisso inabalável com os mais altos padrões de integridade, transparência e segurança da informação.

NOSSOS COMPROMISSOS:
1. Conformidade plena com as leis de proteção de dados e privacidade individual.
2. Certificação internacional contínua no padrão ISO/IEC 27001 de gestão de segurança.
3. Canal aberto de auditoria e ouvidoria cidadã com resposta em até 72 horas úteis.

Para mais esclarecimentos sobre nossas práticas públicas, consulte o portal de transparência.`,
    historicoAcesso: [
      { id: 'h-8', data: '2026-08-26 09:40', usuario: 'visitante (Consultor)', cargo: 'Visitante', nivel: NivelAcesso.PUBLICO, acao: 'Visualização' },
    ],
  },
  {
    id: 'doc-006',
    codigo: 'PROT-2026-099',
    titulo: 'Protocolo Cérbero: Plano de Continuidade e Contingência Nuclear',
    subtitulo: 'Plano de emergência para recuperação de desastres e nós de redundância geodiversos',
    nivelAcesso: NivelAcesso.ULTRASSECRETO,
    departamento: 'Comando Estratégico de Emergência',
    autor: 'Conselho Superior de Defesa',
    cargoAutor: 'Estado-Maior',
    dataCriacao: '2026-04-01',
    ultimaAtualizacao: '2026-08-20',
    status: 'ATIVO',
    paginas: 52,
    tamanho: '31.5 MB',
    tags: ['Contingência', 'Emergência', 'Disaster Recovery', 'Bunker'],
    protocoloSeguranca: 'PROT-OMEGA-999-ULTRA',
    resumo: 'Procedimentos de failover geográfico e migração automatizada de infraestrutura crítica para bunkers autônomos em caso de interrupção global de comunicações.',
    conteudo: `TOP SECRET DOCUMENT // COMPARTMENTED PROTOCOL
═══════════════════════════════════════════════════════════════════
DOC ID: PROT-2026-099
CÓDIGO DE ATIVAÇÃO: CÉRBERO-OMEGA
CLASSIFICAÇÃO: ULTRASSECRETO (NÍVEL 5)

1. CONDICIONANTES DE ATIVAÇÃO
O Protocolo Cérbero será acionado automaticamente mediante queda síncrona de 4 dos 6 backbones principais por mais de 600 segundos.

2. NÓS DE RECUPERAÇÃO GEODIVERSOS
- Nó Alpha: Instalação subterrânea Seridó (Autonomia energética: 180 dias).
- Nó Beta: Sub-banco geológico Chapada (Autonomia: 120 dias).
- Nó Gamma: Instalação orbital de contingência de telemetria.

3. AUTORIZAÇÃO DE DESTRUIÇÃO CRIPTOGRÁFICA
Em caso de risco iminente de captura de hardware, a carga explosiva de termita nos discos rígidos físicos será ativada via código duplo simultâneo do Diretor e Ministro.`,
    historicoAcesso: [
      { id: 'h-9', data: '2026-08-21 19:30', usuario: 'admin (Dr. Arthur Vance)', cargo: 'Diretor', nivel: NivelAcesso.ULTRASSECRETO, acao: 'Inspeção de rotina' },
    ],
  },
  {
    id: 'doc-007',
    codigo: 'AUD-2026-031',
    titulo: 'Auditoria de Vulnerabilidades em Redes Neurais e Modelos de IA',
    subtitulo: 'Testes de injeção de prompt, envenenamento de dados e robustez algorítmica',
    nivelAcesso: NivelAcesso.SECRETO,
    departamento: 'Laboratório de Inteligência Artificial & Defesa',
    autor: 'Dr. Leonardo Shin',
    cargoAutor: 'Pesquisador Chefe de IA',
    dataCriacao: '2026-07-19',
    ultimaAtualizacao: '2026-08-15',
    status: 'ATIVO',
    paginas: 22,
    tamanho: '9.3 MB',
    tags: ['Inteligência Artificial', 'Red Team', 'Robustez', 'Modelos Fundamentais'],
    protocoloSeguranca: 'PROT-SEC-AI-772',
    resumo: 'Relatório técnico confidencial com resultados de testes adversariais executados contra os modelos de triagem de dados e vigilância automatizada.',
    conteudo: `CONFIDENTIAL TECHNICAL AUDIT // LEVEL 4 - SECRETO
═══════════════════════════════════════════════════════════════════
DOC ID: AUD-2026-031
ASSUNTO: AUDITORIA DE SEGURANÇA E ROBUSTEZ EM IA

1. TESTES ADVERSARIAIS APLICADOS
- 10.000 ataques de jailbreak simulados com técnicas de codificação base64 e idiomas raros.
- Taxa de resistência inicial do modelo: 98.4%.
- 16 vetores de evasão identificados e mitigados com guardrails reforçados.

2. SALVAGUARDAS ADICIONADAS
- Camada de sanitização semântica pré-inferência.
- Monitoramento de drift de alinhamento em tempo real.`,
    historicoAcesso: [
      { id: 'h-10', data: '2026-08-22 14:00', usuario: 'agente (Elena Ramos)', cargo: 'Oficial', nivel: NivelAcesso.SECRETO, acao: 'Avaliação de impacto' },
    ],
  },
  {
    id: 'doc-008',
    codigo: 'RH-2026-088',
    titulo: 'Quadro Geral de Credenciais de Segurança e Cargos de Confiança',
    subtitulo: 'Mapeamento confidencial de clearances atribuídas e prazos de renovação de 2026/2027',
    nivelAcesso: NivelAcesso.CONFIDENCIAL,
    departamento: 'Recursos Humanos & Segurança Pessoal',
    autor: 'Patrícia Alcântara',
    cargoAutor: 'Gestora de Credenciamento',
    dataCriacao: '2026-08-01',
    ultimaAtualizacao: '2026-08-25',
    status: 'ATIVO',
    paginas: 12,
    tamanho: '3.8 MB',
    tags: ['Credenciais', 'Clearance', 'Pessoas', 'RH'],
    protocoloSeguranca: 'PROT-RH-CLEAR-301',
    resumo: 'Tabela confidencial de cargos, funcionários ativos, níveis de acesso concedidos por comitê de segurança e histórico de auditorias de background check.',
    conteudo: `CONFIDENTIAL CLEARANCE REGISTRY // LEVEL 3 - CONFIDENCIAL
═══════════════════════════════════════════════════════════════════
DOC ID: RH-2026-088
TÍTULO: MAPEAMENTO DE CREDENCIAIS DE ACESSO ATIVAS

DISTRIBUIÇÃO DE CLEARANCE ATUAL:
- Nível 5 (Ultrassecreto): 3 indivíduos habilitados
- Nível 4 (Secreto): 14 oficiais habilitados
- Nível 3 (Confidencial): 48 analistas habilitados
- Nível 2 (Interno): 210 colaboradores ativos
- Nível 1 (Público): Livre acesso

Todas as credenciais de nível 4 e 5 passam por revalidação a cada 180 dias com investigação social e financeira preventiva.`,
    historicoAcesso: [
      { id: 'h-11', data: '2026-08-25 10:20', usuario: 'analista (Lucas Mendonça)', cargo: 'Analista', nivel: NivelAcesso.CONFIDENCIAL, acao: 'Consulta de auditoria' },
    ],
  },
  {
    id: 'doc-009',
    codigo: 'TI-2026-015',
    titulo: 'Guia de Configuração de VPN e Chaves de Acesso Remoto',
    subtitulo: 'Instruções para instalação de túnel IPSec com autenticação FIDO2',
    nivelAcesso: NivelAcesso.INTERNO,
    departamento: 'Tecnologia da Informação',
    autor: 'Equipe de Infraestrutura',
    cargoAutor: 'Suporte de Redes',
    dataCriacao: '2026-05-18',
    ultimaAtualizacao: '2026-07-20',
    status: 'ATIVO',
    paginas: 8,
    tamanho: '1.9 MB',
    tags: ['VPN', 'Redes', 'FIDO2', 'Tutorial'],
    protocoloSeguranca: 'PROT-TI-VPN-08',
    resumo: 'Passo a passo com capturas de tela para configuração do cliente corporativo de VPN, emparelhamento de chave de segurança física e verificação de integridade.',
    conteudo: `INTERNAL IT DOCUMENTATION // LEVEL 2 - INTERNO
═══════════════════════════════════════════════════════════════════
DOC ID: TI-2026-015
MANUAL DE CONFIGURAÇÃO DE ACESSO REMOTO SEGURO

Passo 1: Baixe o cliente OpenVPN Enterprise homologado pelo portal interno.
Passo 2: Importe o certificado pessoal fornecido pela TI.
Passo 3: Conecte sua chave USB física (YubiKey / Token biométrico) ao solicitar o segundo fator.
Passo 4: Certifique-se de que o antivírus corporativo está atualizado com as definições do dia.`,
    historicoAcesso: [],
  },
  {
    id: 'doc-010',
    codigo: 'REL-2026-004',
    titulo: 'Relatório de Sustentabilidade e Eficiência Energética 2026',
    subtitulo: 'Indicadores ambientais e metas de carbono neutro dos centros de processamento',
    nivelAcesso: NivelAcesso.PUBLICO,
    departamento: 'Comitê ESG & Sustentabilidade',
    autor: 'Comitê de Sustentabilidade',
    cargoAutor: 'Coordenação ESG',
    dataCriacao: '2026-03-10',
    ultimaAtualizacao: '2026-06-30',
    status: 'ATIVO',
    paginas: 30,
    tamanho: '4.2 MB',
    tags: ['ESG', 'Energia Solar', 'Verde', 'Relatório Anual'],
    protocoloSeguranca: 'PROT-PUB-ESG-04',
    resumo: 'Publicação institucional detalhando a redução de 40% na pegada hídrica e a transição integral dos servidores para matriz 100% fotovoltaica.',
    conteudo: `PUBLIC ANNUAL REPORT // ESG 2026 // LEVEL 1 - PÚBLICO
═══════════════════════════════════════════════════════════════════
DOC ID: REL-2026-004
RELATÓRIO DE SUSTENTABILIDADE E EFICIÊNCIA ENERGÉTICA

Destaques do ano:
- 100% da energia consumida nos data centers provém de fontes renováveis certificadas.
- PUE (Power Usage Effectiveness) reduzido para 1.12 nos complexos de alta densidade.
- Reciclagem integral de resíduos eletrônicos através de cadeia reversa rastreada.`,
    historicoAcesso: [],
  },
];
