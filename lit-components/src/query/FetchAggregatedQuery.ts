import {Query} from "./Query";
import {Dataset} from "./Dataset";
import {LapisFilter} from "../types";

export class FetchAggregatedQuery<Fields> implements Query<Fields & {count: number}> {

  private api = "https://lapis.cov-spectrum.org/open/v1/sample";

  constructor(private filter: LapisFilter, private fields: string[]) {
  }

  async evaluate(signal?: AbortSignal): Promise<Dataset<Fields & {count: number}>> {
    const params = new URLSearchParams(this.filter);
    params.set('fields', this.fields.join(','))
    const data = (await (await fetch(`${this.api}/aggregated?${params.toString()}`, {signal})).json()).data;
    return {
      content: data
    };
  }

}
