import {Query} from "./Query";
import {Dataset} from "./Dataset";

export class GroupByQuery implements Query {
  constructor(private child: Query, private field: string, private aggregate: (values: any[]) => any) {
  }

  async evaluate(signal?: AbortSignal): Promise<Dataset> {
    const childEvaluated = await this.child.evaluate(signal);
    const grouped = new Map<any, any[]>();
    for (let row of childEvaluated.content) {
      const key = row[this.field];
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(row);
    }
    const result = [];
    for (let [, values] of grouped) {
      result.push(this.aggregate(values));
    }

    return {
      content: result
    };
  }

  getChildren(): Query[] {
    return [];
  }

}
