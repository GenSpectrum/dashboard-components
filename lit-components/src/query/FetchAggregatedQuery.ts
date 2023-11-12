import {Query} from "./Query";
import {Dataset} from "./Dataset";

export class FetchAggregatedQuery implements Query {

  private api = "https://lapis.cov-spectrum.org/open/v1/sample";

  constructor(private filter: {country: string}, private fields: string[]) {
  }

  async evaluate(signal?: AbortSignal): Promise<Dataset> {
    const params = new URLSearchParams(this.filter);
    params.set('fields', this.fields.join(','))
    const data: {
      date: string | null,
      count: number
    }[] = (await (await fetch(`${this.api}/aggregated?${params.toString()}`, {signal})).json()).data;
    return {
      content: data
    };
  }

  getChildren(): Query[] {
    return [];
  }

}
