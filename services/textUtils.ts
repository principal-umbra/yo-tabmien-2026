
/**
 * Normaliza un texto eliminando acentos, trim y convirtiéndolo a minúsculas
 * para comparaciones robustas.
 */
export const normalizeText = (text: string): string => {
    return text
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};
