import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { criarDocumento } from '../../store/documentSlice';
import { logSecurityEvent } from '../../store/authSlice';
import { NivelAcesso } from '../../types/auth';
import { NIVEIS_INFO } from '../../types/document';
import { X, FilePlus2, Check, AlertTriangle } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<NivelAcesso>(NivelAcesso.PUBLICO);
  const [resumo, setResumo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [contemDadosSensiveis, setContemDadosSensiveis] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  // Ao abrir o modal, inicializa com o departamento do usuário sanitizado (sem números e max 50)
  React.useEffect(() => {
    if (isOpen) {
      const initialDept = (user?.departamento || '').replace(/[0-9]/g, '').slice(0, 50);
      setDepartamento(initialDept);
      setErrorMsg('');
    }
  }, [isOpen, user?.departamento]);

  if (!isOpen) return null;

  const generateId = () => {
    return 'DOC' + Math.floor(Math.random() * 9000 + 1000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!titulo.trim() || !departamento.trim() || !resumo.trim() || !conteudo.trim()) {
      setErrorMsg('Campos obrigatórios não preenchidos.');
      return;
    }

    if (/\d/.test(departamento)) {
      setErrorMsg('O campo Departamento Responsável não pode conter números, apenas texto.');
      return;
    }

    if (departamento.length > 50) {
      setErrorMsg('O campo Departamento Responsável não pode exceder 50 caracteres.');
      return;
    }

    if (!aceiteTermos) {
      setErrorMsg('Você deve aceitar o termo de responsabilidade (LGPD) para prosseguir.');
      return;
    }

    if (nivelAcesso > user.nivelAcesso) {
      setErrorMsg('Você não tem autorização para criar documentos com nível superior ao seu.');
      dispatch(
        logSecurityEvent({
          tipo: 'AVISO',
          mensagem: `Usuário tentou emitir documento com classificação LVL_${nivelAcesso} (Maior que LVL_${user.nivelAcesso})`,
          documentoCodigo: 'NEW_DOC',
          nivelTentativa: nivelAcesso,
        })
      );
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (contemDadosSensiveis && !tags.includes('DADOS_PESSOAIS (PII)')) {
      tags.push('DADOS_PESSOAIS (PII)');
    }

    setIsSubmitting(true);
    const newDocId = generateId();
    const dataAtual = new Date().toISOString().split('T')[0];

    dispatch(
      criarDocumento({
        documento: {
          id: newDocId,
          codigo: `${newDocId}-G${nivelAcesso}`,
          titulo,
          subtitulo,
          departamento,
          nivelAcesso,
          autor: user.nome,
          cargoAutor: user.cargo || 'Operador',
          dataCriacao: dataAtual,
          ultimaAtualizacao: dataAtual,
          status: 'ATIVO',
          tags,
          resumo,
          conteudo,
          contemDadosSensiveis,
          paginas: Math.max(1, Math.ceil(conteudo.length / 1500)),
          protocoloSeguranca: `PROT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          historicoAcesso: [
            {
              id: 'hist1',
              usuario: user.nome,
              cargo: user.cargo || 'Operador',
              nivel: user.nivelAcesso,
              acao: 'CRIAÇÃO',
              data: dataAtual,
            },
          ],
        },
        usuarioId: user.id
      })
    );

    dispatch(
      logSecurityEvent({
        tipo: 'INFO',
        mensagem: `Documento classificado ${newDocId}-G${nivelAcesso} criado com sucesso.`,
        documentoCodigo: `${newDocId}-G${nivelAcesso}`,
      })
    );

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="new-document-modal"
        className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 bg-[var(--color-surface-panel)] border-b border-[var(--color-surface-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border border-[var(--color-surface-border)] flex items-center justify-center">
              <FilePlus2 className="w-5 h-5 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">
                REGISTRAR_NOVO_DOCUMENTO
              </h3>
              <p className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase tracking-[0.2em] mt-1">
                SISTEMA CORPORATIVO RBAC • EMISSÃO DE REGISTRO
              </p>
            </div>
          </div>
          <button
            id="close-new-doc-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/20 border-l-2 border-[var(--color-accent-red)] text-white text-[10px] font-mono flex items-center gap-2 uppercase">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--color-accent-red)]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Classification Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
              Nível de Classificação de Segurança *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {([
                NivelAcesso.PUBLICO,
                NivelAcesso.INTERNO,
                NivelAcesso.CONFIDENCIAL,
                NivelAcesso.SECRETO,
                NivelAcesso.ULTRASSECRETO,
              ] as NivelAcesso[])
                .filter((level) => !user || level <= user.nivelAcesso)
                .map((level) => {
                const info = NIVEIS_INFO[level];
                const isSelected = nivelAcesso === level;
                return (
                  <button
                    key={level}
                    type="button"
                    id={`select-level-${level}`}
                    onClick={() => setNivelAcesso(level)}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#111] border-[var(--color-accent-amber)]'
                        : 'bg-[#0a0a0a] border-[#222] hover:border-[#444]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${isSelected ? 'text-[var(--color-accent-amber)]' : 'text-white'}`}>
                      {info.nome}
                    </span>
                    <span className="text-[9px] text-[#555] font-mono mt-1 uppercase">
                      LVL {level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Título do Documento *
              </label>
              <span className="text-[9px] font-mono text-[#666]">
                {titulo.length}/100
              </span>
            </div>
            <input
              id="input-doc-titulo"
              type="text"
              required
              maxLength={100}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, 100))}
              placeholder="EX: PLANO DE RESPOSTA A INCIDENTES Q4"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors"
            />
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Subtítulo / Ementa
              </label>
              <span className="text-[9px] font-mono text-[#666]">
                {subtitulo.length}/150
              </span>
            </div>
            <input
              id="input-doc-subtitulo"
              type="text"
              maxLength={150}
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value.slice(0, 150))}
              placeholder="EX: ANÁLISE DAS MÉTRICAS DE MITIGAÇÃO DO CONSÓRCIO"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors"
            />
          </div>

          {/* Department and Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Departamento Responsável *
                </label>
                <span className="text-[9px] font-mono text-[#666]">
                  {departamento.length}/50
                </span>
              </div>
              <input
                id="input-doc-dept"
                type="text"
                required
                maxLength={50}
                value={departamento}
                onKeyDown={(e) => {
                  // Bloqueia digitação direta de 0 a 9
                  if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  // Filtra números ao colar
                  e.preventDefault();
                  const pasteData = e.clipboardData.getData('text');
                  const sanitized = (departamento + pasteData.replace(/[0-9]/g, '')).slice(0, 50);
                  setDepartamento(sanitized);
                }}
                onChange={(e) => {
                  // Remove qualquer número digitado ou colado e restringe a no máximo 50 caracteres
                  const textOnly = e.target.value.replace(/[0-9]/g, '').slice(0, 50);
                  setDepartamento(textOnly);
                }}
                placeholder="EX: DEPARTAMENTO DE INTELIGÊNCIA"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Tags / Palavras-chave
                </label>
                <span className="text-[9px] font-mono text-[#666]">
                  {tagsInput.length}/100
                </span>
              </div>
              <input
                id="input-doc-tags"
                type="text"
                maxLength={100}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value.slice(0, 100))}
                placeholder="SEPARADAS POR VÍRGULA"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Resumo Executivo *
              </label>
              <span className="text-[9px] font-mono text-[#666]">
                {resumo.length}/300
              </span>
            </div>
            <textarea
              id="input-doc-resumo"
              rows={2}
              required
              maxLength={300}
              value={resumo}
              onChange={(e) => setResumo(e.target.value.slice(0, 300))}
              placeholder="BREVE SUMÁRIO DOS PONTOS CENTRAIS ABORDADOS..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[11px] font-mono focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Conteúdo do Documento (Corpo Principal) *
              </label>
              <span className="text-[9px] font-mono text-[#666]">
                {conteudo.length}/5000
              </span>
            </div>
            <textarea
              id="input-doc-conteudo"
              rows={5}
              required
              maxLength={5000}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value.slice(0, 5000))}
              placeholder="DIGITE AS CLÁUSULAS, PARECERES OU DIRETRIZES..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-[#ccc] text-[11px] font-mono focus:outline-none focus:border-[var(--color-accent-amber)] transition-colors whitespace-pre-wrap leading-loose"
            />
          </div>

          {/* LGPD Compliance Section */}
          <div className="bg-[#111] border border-[#222] p-4 mt-4 space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[var(--color-accent-amber)]" />
              Diretrizes de Conformidade (LGPD)
            </h4>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  id="checkbox-dados-sensiveis"
                  type="checkbox"
                  checked={contemDadosSensiveis}
                  onChange={(e) => setContemDadosSensiveis(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border border-[#444] bg-[#0a0a0a] peer-checked:bg-[var(--color-accent-amber)] peer-checked:border-[var(--color-accent-amber)] transition-colors"></div>
                <div className="absolute hidden peer-checked:block text-[#0a0a0a]">
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${contemDadosSensiveis ? 'text-[var(--color-accent-amber)]' : 'text-[#888] group-hover:text-white'}`}>
                  [ CONTÉM DADOS PESSOAIS (PII) ]
                </span>
                <span className="text-[9px] text-[#555] font-mono uppercase mt-1 leading-relaxed">
                  Sinalize se o documento contém informações que identificam indivíduos (nomes, CPFs, endereços, etc).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-[#222]">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  id="checkbox-termos-lgpd"
                  type="checkbox"
                  checked={aceiteTermos}
                  onChange={(e) => setAceiteTermos(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border border-[#444] bg-[#0a0a0a] peer-checked:bg-[var(--color-text-main)] peer-checked:border-[var(--color-text-main)] transition-colors"></div>
                <div className="absolute hidden peer-checked:block text-[#0a0a0a]">
                  <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${aceiteTermos ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>
                  TERMO DE RESPONSABILIDADE *
                </span>
                <span className="text-[9px] text-[#555] font-mono uppercase mt-1 leading-relaxed">
                  Confirmo que o armazenamento destas informações possui amparo em uma das bases legais do Art. 7º da LGPD. Assumo a responsabilidade pelo tratamento dos dados anexados.
                </span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--color-surface-border)] flex items-center justify-end gap-3 mt-6">
            <button
              id="cancel-new-doc-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              CANCELAR
            </button>
            <button
              id="submit-new-doc-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-[10px] font-mono font-bold bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-[var(--color-surface-bg)] transition-colors flex items-center gap-2 tracking-widest uppercase disabled:opacity-50 disabled:cursor-wait"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'PROCESSANDO...' : 'CLASSIFICAR_E_SALVAR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};