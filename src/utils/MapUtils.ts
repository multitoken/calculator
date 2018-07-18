import { DeepClone } from '../repository/models/DeepClone';

export class MapUtils {

  public static readonly EMPTY_MAP: Map<any, any> = new Map();

  public static clone(map: Map<DeepClone | number | string, DeepClone | number | string>): Map<any, any> {
    const result: Map<any, any> = new Map();
    const firstKey: DeepClone | number | string | undefined = map.keys().next().value;
    const firstValue: DeepClone | number | string | undefined = map.values().next().value;
    const needCloneKey: boolean = typeof firstKey !== 'string' && typeof firstKey !== 'number';
    const needCloneValue: boolean = typeof firstValue !== 'string' && typeof firstValue !== 'number';

    map.forEach((originValue, originKey) => {
      result.set(
        needCloneKey ? (originKey as DeepClone).clone() : originKey,
        needCloneValue ? (originValue as DeepClone).clone() : originValue
      );
    });

    return result;
  }

}
