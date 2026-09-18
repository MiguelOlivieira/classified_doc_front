import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>
      
      <div className="z-10 bg-[#0a0a0a] border border-[#222] p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-text-muted)] opacity-20"></div>
        
        <Ghost className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-6 opacity-80" />
        
        <h1 className="text-3xl font-mono font-bold text-white uppercase tracking-widest mb-2">
          404
        </h1>
        <h2 className="text-[12px] font-mono text-[var(--color-accent-amber)] uppercase tracking-widest mb-6 border-b border-[#222] pb-4">
          ENDEREÇO NÃO LOCALIZADO
        </h2>
        
        <p className="text-[10px] text-[#888] font-mono uppercase tracking-widest leading-relaxed mb-8">
          A rota especificada não existe na estrutura deste servidor. O sistema não fornecerá detalhes adicionais por razões de segurança.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 bg-[#111] border border-[#333] hover:border-[var(--color-text-main)] text-[var(--color-text-muted)] hover:text-white transition-colors text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          RETORNAR AO PAINEL SEGURO
        </button>
      </div>
    </div>
  );
};
