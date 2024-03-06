import { Scale } from 'chart.js';
import { Chart } from 'chart.js/dist/types';

export class LogitScale extends Scale {
    static id = 'logit';

    constructor(cfg: { id: string; type: string; ctx: CanvasRenderingContext2D; chart: Chart }) {
        super(cfg);
        this.min = 0.001;
        this.max = 0.999;
    }

    override buildTicks() {
        const tickValues = [this.min, 0.01, 0.1, 0.5, 0.9, 0.99, this.max];

        this.ticks = tickValues.map((value) => ({ value }));
        return this.ticks;
    }

    getLogit(value: number): number {
        if (value <= 0) {
            return -Infinity;
        }
        if (value >= 1) {
            return Infinity;
        }

        return Math.log(value / (1 - value));
    }

    override getPixelForValue(value: number): number {
        const logitMin = this.getLogit(this.min);
        const logitMax = this.getLogit(this.max);

        const logitValue = this.getLogit(value);

        const decimal = (logitValue - logitMin) / (logitMax - logitMin);

        return this.getPixelForDecimal(decimal);
    }
}
