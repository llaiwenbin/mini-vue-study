import { isTracking, trackEffects, triggerEffects } from "./effect.js";
import { reactive } from "./reactive.js";

export class RefImpl {

  constructor(val) {
    this._rawValue = val;
    this._value = convert(val)

    this.__v_isRef = true;
    this.dep = [];
  }
  // ref、reative之间的区别主要在于reative的响应列表deps放在targetMap上、而ref放在当前类的dep下。
  // 相同点在于最终都会被收集到effect当中去
  get value() {
    trackRefValue(this)
    // 收集

    return this._value;
  }

  set value(newValue) {

    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      // 触发
      triggerEffects(this.dep)
    }
  }
}
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return createRef(value);
}


function createRef(value) {
  const refImpl = new RefImpl(value);

  return refImpl;
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}


export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
