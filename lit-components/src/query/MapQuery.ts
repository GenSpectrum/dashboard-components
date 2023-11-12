import {Query} from "./Query";
import {Dataset} from "./Dataset";

export class MapQuery implements Query {
  constructor(private child: Query, private func: (value: any) => any) {
  }

  async evaluate(signal?: AbortSignal): Promise<Dataset> {
    const childEvaluated = await this.child.evaluate(signal);
    return {
      content: childEvaluated.content.map(this.func)
    }
  }

  getChildren(): Query[] {
    return [this.child];
  }

}
