
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

/**
 * Compara la respuesta del usuario con la respuesta correcta.
 * Es robusta ante:
 * - Acentos/Tildes
 * - Mayúsculas/Minúsculas
 * - Plurales simples (añadir/quitar 's')
 * - Espacios extra
 */
export const compareRiddle = (userInput: string, correctAnswer: string): boolean => {
    const normInput = normalizeText(userInput);
    const normAnswer = normalizeText(correctAnswer);

    // 1. Coincidencia exacta (normalizada)
    if (normInput.includes(normAnswer)) return true;

    // 2. Coincidencia singular/plural (p.ej. "mano" vs "manos")
    // Si la respuesta es "mano" pero el usuario pone "manos", o viceversa
    const answerSingular = normAnswer.endsWith('s') ? normAnswer.slice(0, -1) : normAnswer;
    const answerPlural = normAnswer.endsWith('s') ? normAnswer : normAnswer + 's';

    if (normInput.includes(answerSingular) || normInput.includes(answerPlural)) {
        return true;
    }

    return false;
};
