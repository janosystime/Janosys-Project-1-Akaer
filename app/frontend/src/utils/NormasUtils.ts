import type { Norma } from "../components/Normas/NormasViewModel";

export const converterParaBase64 = (arquivoAtual: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivoAtual);
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = (erroAtual) => reject(erroAtual);
  });
};

export function normalizarUrlPdf(urlPdf?: string): string | undefined {
  if (!urlPdf) return urlPdf;
  if (
    urlPdf.startsWith("data:") ||
    urlPdf.startsWith("blob:") ||
    urlPdf.startsWith("http://") ||
    urlPdf.startsWith("https://") ||
    urlPdf.startsWith("/pdf/")
  ) {
    return urlPdf;
  }

  if (urlPdf.startsWith("/")) {
    return `/pdf${urlPdf}`;
  }

  return `/pdf/${urlPdf}`;
}

export function normalizarNormasSalvas(
  normasSalvas: Norma[],
  normasBase: Norma[],
): Norma[] {
  return normasSalvas.map((normaAtual) => {
    const normaBase = normasBase.find(nb => nb.id === normaAtual.id);
    return {
      ...normaAtual,
      urlPdf: normaAtual.urlPdf
        ? normalizarUrlPdf(normaAtual.urlPdf)
        : normaBase?.urlPdf,
      imagens: normaAtual.imagens?.length
        ? normaAtual.imagens
        : normaBase?.imagens,
      nomePdf: normaAtual.nomePdf || normaBase?.nomePdf,
    };
  });
}

export function safeParseArray(valor: any): string[] {
  if (valor === undefined || valor === null) return [];
  if (Array.isArray(valor)) {
    return valor.map(item => typeof item === 'string' ? item : JSON.stringify(item));
  }
  if (typeof valor === 'string') {
    if (!valor.trim()) return [];
    try {
      const parsed = JSON.parse(valor);
      if (typeof parsed === 'string') {
        return safeParseArray(parsed);
      }
      if (Array.isArray(parsed)) {
        return parsed.map(item => typeof item === 'string' ? item : JSON.stringify(item));
      }
      return [String(parsed)];
    } catch {
      return [valor];
    }
  }
  return [JSON.stringify(valor)];
}

