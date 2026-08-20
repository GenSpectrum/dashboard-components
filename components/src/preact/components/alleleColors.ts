export type AlleleColor = { background: string; color: string };

// Classic bioinformatics nucleotide color scheme (A=green, T=red, C=blue, G=yellow)
const nucleotideColors: Record<string, AlleleColor> = {
    A: { background: '#4CAF50', color: '#fff' },
    T: { background: '#EF5350', color: '#fff' },
    C: { background: '#42A5F5', color: '#fff' },
    G: { background: '#FFA726', color: '#fff' },
    U: { background: '#AB47BC', color: '#fff' },
};

// Amino acid colors by chemical property
const aminoAcidColors: Record<string, AlleleColor> = {
    // Nonpolar hydrophobic
    A: { background: '#FFA726', color: '#fff' },
    V: { background: '#FFA726', color: '#fff' },
    I: { background: '#FFA726', color: '#fff' },
    L: { background: '#FFA726', color: '#fff' },
    M: { background: '#FFA726', color: '#fff' },
    F: { background: '#FFA726', color: '#fff' },
    W: { background: '#FFA726', color: '#fff' },
    P: { background: '#CE93D8', color: '#fff' },
    // Polar uncharged
    S: { background: '#26A69A', color: '#fff' },
    T: { background: '#26A69A', color: '#fff' },
    N: { background: '#26A69A', color: '#fff' },
    Q: { background: '#26A69A', color: '#fff' },
    Y: { background: '#26A69A', color: '#fff' },
    C: { background: '#FFD54F', color: '#333' },
    // Positively charged
    K: { background: '#42A5F5', color: '#fff' },
    R: { background: '#42A5F5', color: '#fff' },
    H: { background: '#80CAFF', color: '#333' },
    // Negatively charged
    D: { background: '#EF5350', color: '#fff' },
    E: { background: '#EF5350', color: '#fff' },
    // Special
    G: { background: '#9E9E9E', color: '#fff' },
};

/**
 * Returns a background+text color for an allele symbol.
 * Nucleotide positions have the form `[123]`; amino acid positions have a gene prefix, e.g. `S[501]`.
 */
export function getAlleleColor(position: string, allele: string): AlleleColor | undefined {
    const isAminoAcid = /^[A-Za-z]+\[/.test(position);
    const map = isAminoAcid ? aminoAcidColors : nucleotideColors;
    return map[allele];
}
