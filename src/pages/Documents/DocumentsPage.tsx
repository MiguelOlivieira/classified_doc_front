import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearchTerm,
  setSelectedClassification,
  setSelectedDepartment,
} from '../../store/documentSlice';
import { DocumentCard } from '../../components/DocumentCard/DocumentCard';
import { NivelAcesso } from '../../types/auth';
import { podeAcessar } from '../../types/document';
import { Search, Filter, FileText } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const filtroParam = searchParams.get('filtro');

  const { user } = useAppSelector((state) => state.auth);
  const userNivel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;

  const {
    documents: allDocuments,
    favoritos,
    documentosRecentesPorUsuario = {},
    searchTerm,
    selectedClassification,
    selectedDepartment,
  } = useAppSelector((state) => state.documents);
  const documentosRecentes = user?.id ? (documentosRecentesPorUsuario[user.id] || []) : [];

  const documents = useMemo(
    () => allDocuments.filter((doc) => podeAcessar(userNivel, doc.nivelAcesso)),
    [allDocuments, userNivel]
  );

  const departments = useMemo(() => {
    const depts = new Set(documents.map((d) => d.departamento));
    return ['TODOS', ...Array.from(depts)];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (filtroParam === 'favoritos') {
      result = result.filter((d) => favoritos.includes(d.id));
    } else if (filtroParam === 'recentes') {
      result = result.filter((d) => documentosRecentes.includes(d.id));
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.titulo.toLowerCase().includes(lowerTerm) ||
          d.codigo.toLowerCase().includes(lowerTerm) ||
          d.tags.some((t) => t.toLowerCase().includes(lowerTerm))
      );
    }

    if (selectedClassification !== 'TODOS') {
      result = result.filter((d) => d.nivelAcesso === Number(selectedClassification));
    }

    if (selectedDepartment !== 'TODOS') {
      result = result.filter((d) => d.departamento === selectedDepartment);
    }

    return result;
  }, [
    documents,
    filtroParam,
    favoritos,
    documentosRecentes,
    searchTerm,
    selectedClassification,
    selectedDepartment,
  ]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col gap-4 border-b border-[var(--color-surface-border)] pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-white">
            BANCO_DE_DADOS_CLASSIFICADO
          </h1>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase mt-1">
            Consulte registros classificados de acordo com seu nível de autorização.
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por ID, título ou tags..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full pl-9 pr-3 py-2 bg-[#111] border border-[var(--color-surface-border)] text-[11px] font-mono text-white placeholder:text-[#555] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedClassification}
              onChange={(e) =>
                dispatch(
                  setSelectedClassification(
                    e.target.value === 'TODOS'
                      ? 'TODOS'
                      : (Number(e.target.value) as NivelAcesso)
                  )
                )
              }
              className="bg-[#111] border border-[var(--color-surface-border)] px-3 py-2 text-[11px] font-mono uppercase text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
            >
              <option value="TODOS">CLASSIFICAÇÃO [TODAS]</option>
              <option value={NivelAcesso.PUBLICO}>NÍVEL 1: PÚBLICO</option>
              <option value={NivelAcesso.INTERNO}>NÍVEL 2: INTERNO</option>
              <option value={NivelAcesso.CONFIDENCIAL}>NÍVEL 3: CONFIDENCIAL</option>
              <option value={NivelAcesso.SECRETO}>NÍVEL 4: SECRETO</option>
              <option value={NivelAcesso.ULTRASSECRETO}>NÍVEL 5: ULTRASSECRETO</option>
            </select>
            <select
              value={selectedDepartment}
              onChange={(e) => dispatch(setSelectedDepartment(e.target.value))}
              className="bg-[#111] border border-[var(--color-surface-border)] px-3 py-2 text-[11px] font-mono uppercase text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors max-w-[200px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'TODOS' ? 'DEPTO [TODOS]' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[var(--color-surface-panel)] z-10 border-b border-[var(--color-surface-border)]">
              <tr className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-mono">
                <th className="px-4 py-3 font-normal w-10"></th>
                <th className="px-4 py-3 font-normal w-36">ID</th>
                <th className="px-4 py-3 font-normal">Título</th>
                <th className="px-4 py-3 font-normal w-40">Classificação</th>
                <th className="px-4 py-3 font-normal w-48 hidden md:table-cell">Autor</th>
                <th className="px-4 py-3 font-normal w-32 hidden lg:table-cell">Atualizado</th>
                <th className="px-4 py-3 font-normal text-right w-32">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} documento={doc} viewMode="table" />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-[var(--color-text-muted)]">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 mb-4 opacity-20" />
                      <p className="text-[11px] font-mono uppercase tracking-widest">NENHUM REGISTRO CORRESPONDE À BUSCA</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[var(--color-surface-panel)] p-3 border-t border-[var(--color-surface-border)] text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest flex justify-between items-center">
          <span>REGISTROS ENCONTRADOS: {filteredDocuments.length}</span>
          <span>NÍVEL_AUTORIZAÇÃO_OP: {userNivel}</span>
        </div>
      </div>
    </div>
  );
};
