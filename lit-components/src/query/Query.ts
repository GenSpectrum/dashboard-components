import {Dataset} from "./Dataset";

export interface Query<T> {

  evaluate(signal?: AbortSignal): Promise<Dataset<T>>;

}
