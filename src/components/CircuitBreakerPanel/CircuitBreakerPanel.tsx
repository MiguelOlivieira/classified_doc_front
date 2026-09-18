import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Play } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface CBStats {
  fires: number;
  failures: number;
  fallbacks: number;
  rejects: number;
  timeouts: number;
}

interface CBData {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  isUnstable: boolean;
  stats: CBStats;
  options: {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
  };
}

export const CircuitBreakerPanel: React.FC = () => {
  const [data, setData] = useState<CBData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchCBStatus = async () => {
    try {
      const res = await apiFetch('/api/system/circuit-breaker');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao buscar status do Circuit Breaker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCBStatus();
    const interval = setInterval(fetchCBStatus, 2500); // Polling rápido para demonstração ao vivo
    return () => clearInterval(interval);
  }, []);

  const handleToggleInstability = async () => {
    if (!data) return;
    setIsToggling(true);
    try {
      const res = await apiFetch('/api/system/toggle-abac-instability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unstable: !data.isUnstable }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(prev => prev ? { ...prev, isUnstable: json.isUnstable, state: json.state } : null);
      }
    } catch (err) {
      console.error('Erro ao alternar instabilidade:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleTriggerTestRequest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Fazemos uma requisição para carregar o documento "doc-002" que passa pelo Motor ABAC
      // (Não usamos doc-001 porque ele é ULTRASSECRETO e ativa o MFA Step-up Auth)
      const res = await apiFetch('/api/documentos/doc-002', {
        headers: {
          'x-user-id': 'usr-001', // ID do admin
        }
      });
      const json = await res.json();
      
      if (res.ok) {
        setTestResult({
          status: 'success',
          message: `Sucesso: Documento "${json.document?.titulo}" carregado normalmente.`
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Bloqueado: ${json.error || 'Acesso negado'}`
        });
      }
      fetchCBStatus(); // Força atualização imediata após requisição
    } catch (err) {
      setTestResult({
        status: 'error',
        message: 'Erro de conexão na requisição de teste.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#1e293b] border border-slate-700 rounded p-6 flex justify-center items-center">
        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
        <span className="text-xs text-slate-400">Carregando telemetria de resiliência...</span>
      </div>
    );
  }

  const stateColors = {
    CLOSED: {
      bg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500',
      label: 'FECHADO (Operação Normal)',
      desc: 'O motor ABAC externo está respondendo perfeitamente. Todas as requisições de acesso fluem sem latência.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
    },
    OPEN: {
      bg: 'bg-rose-950/30 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500 animate-pulse',
      label: 'ABERTO (Fail-Closed Ativo)',
      desc: 'O circuito detectou falhas repetidas no motor ABAC e abriu. Para evitar brechas de segurança por indisponibilidade, o sistema entrou em modo de degradação robusto bloqueando o acesso.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />
    },
    HALF_OPEN: {
      bg: 'bg-amber-950/30 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500 animate-bounce',
      label: 'MEIO-ABERTO (Testando Recuperação)',
      desc: 'O tempo de resiliência expirou. O sistema está enviando requisições piloto para verificar se o motor ABAC voltou a operar normalmente.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    }
  };

  const currentConfig = data ? stateColors[data.state] : stateColors.CLOSED;

  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Demonstração de Resiliência: Circuit Breaker (Opossum)
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">Telemetry Mode: Live</span>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Este painel foi projetado especificamente para fins de <strong>auditoria acadêmica e demonstração prática</strong> do padrão de resiliência <strong>Circuit Breaker</strong>. Ele permite simular cenários de falha na dependência do Motor ABAC de autorização e observar como a aplicação se comporta de forma segura (<em>Fail-Closed</em>).
      </p>

      {/* Live State Display */}
      <div className={`p-4 rounded border ${currentConfig.bg} mb-6 flex gap-4 items-start`}>
        <div className="mt-1 shrink-0">{currentConfig.icon}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider uppercase">Status do Circuito:</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentConfig.badge}`} />
              <span className="text-xs font-bold">{currentConfig.label}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{currentConfig.desc}</p>
        </div>
      </div>

      {/* Simulators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Toggle Box */}
        <div className="bg-slate-900/60 p-4 rounded border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200 mb-1">Passo 1: Simular Queda do Motor ABAC</p>
            <p className="text-[11px] text-slate-400 mb-4">
              Ative a simulação para fazer o serviço de autorização ABAC externo falhar instantaneamente.
            </p>
          </div>
          <button
            onClick={handleToggleInstability}
            disabled={isToggling}
            className={`w-full py-1.5 px-3 rounded text-xs font-semibold border transition ${
              data?.isUnstable
                ? 'bg-rose-900/40 border-rose-600 text-rose-200 hover:bg-rose-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {data?.isUnstable ? '🔴 Simulação Ativa (Falhando)' : '⚪ Ativar Simulação de Falha'}
          </button>
        </div>

        {/* Trigger Request Box */}
        <div className="bg-slate-900/60 p-4 rounded border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200 mb-1">Passo 2: Disparar Requisições de Teste</p>
            <p className="text-[11px] text-slate-400 mb-4">
              Faça disparos de autorização. Com a simulação ativa, errar &gt;50% das requisições abrirá o circuito.
            </p>
          </div>
          <button
            onClick={handleTriggerTestRequest}
            disabled={isTesting}
            className="w-full py-1.5 px-3 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30 transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3" />
            {isTesting ? 'Disparando...' : 'Disparar Requisição de Teste'}
          </button>
        </div>
      </div>

      {/* Test results alert */}
      {testResult && (
        <div className={`p-3 rounded text-xs border mb-6 ${
          testResult.status === 'success'
            ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
            : 'bg-rose-950/20 border-rose-900/50 text-rose-400'
        }`}>
          <span className="font-bold">Resultado do Teste:</span> {testResult.message}
        </div>
      )}

      {/* Live Telemetry Metrics */}
      {data && (
        <div className="bg-slate-950/50 p-4 rounded border border-slate-800 font-mono text-xs text-slate-400">
          <p className="text-[11px] font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1">
            ESTATÍSTICAS EM TEMPO REAL (OPOSSUM METRICS)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
            <div>
              <p className="text-slate-500">Requisições (Fires):</p>
              <p className="text-slate-200 font-bold">{data.stats.fires}</p>
            </div>
            <div>
              <p className="text-slate-500">Falhas de Serviço:</p>
              <p className="text-rose-400 font-bold">{data.stats.failures}</p>
            </div>
            <div>
              <p className="text-slate-500">Redirecionamentos Fallback:</p>
              <p className="text-blue-400 font-bold">{data.stats.fallbacks}</p>
            </div>
            <div>
              <p className="text-slate-500 font-mono">Bloqueios de Circuito:</p>
              <p className="text-amber-500 font-bold">{data.stats.rejects}</p>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 flex justify-between">
            <span>Timeout de Proteção: 3.0s</span>
            <span>Threshold de Abertura: 50%</span>
            <span>Reset Automático: 10s</span>
          </div>
        </div>
      )}
    </div>
  );
};
