import {Dataset} from "./Dataset";

export interface Query {

  getChildren(): Query[];

  evaluate(signal?: AbortSignal): Promise<Dataset>;

}
