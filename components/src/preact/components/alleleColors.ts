// Classic bioinformatics nucleotide color scheme (A=green, T=red, C=blue, G=yellow)
const nucleotideColors: Record<string, string> = {
    A: '#4CAF50',
    T: '#EF5350',
    C: '#42A5F5',
    G: '#FFA726',
    U: '#AB47BC',
};

// Amino acid colors by chemical property
const aminoAcidColors: Record<string, string> = {
    // Nonpolar hydrophobic
    A: '#FFA726',
    V: '#FFA726',
    I: '#FFA726',
    L: '#FFA726',
    M: '#FFA726',
    F: '#FFA726',
    W: '#FFA726',
    P: '#CE93D8',
    // Polar uncharged
    S: '#26A69A',
    T: '#26A69A',
    N: '#26A69A',
    Q: '#26A69A',
    Y: '#26A69A',
    C: '#F9A825',
    // Positively charged
    K: '#42A5F5',
    R: '#42A5F5',
    H: '#80CAFF',
    // Negatively charged
    D: '#EF5350',
    E: '#EF5350',
    // Special
    G: '#9E9E9E',
};

/**
 * Returns a color for an allele symbol.
 * Nucleotide positions have the form `[123]`; amino acid positions have a gene prefix, e.g. `S[501]`.
 */
export function getAlleleColor(position: string, allele: string): string | undefined {
    const isAminoAcid = /^[A-Za-z]+\[/.test(position);
    const map = isAminoAcid ? aminoAcidColors : nucleotideColors;
    return map[allele];
}
