import { track, trigger } from "./effect.js";
import { reactive, ReactiveFlags } from "./reactive.js";
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

function createGetter(target, key, receiver) {
  if (key === ReactiveFlags.IS_REACTIVE) {
    return true;
  }
  track(target, key);
  const res = Reflect.get(target, key, receiver);
  if (isObject(res)) {
    // 把内部所有的是 object 的值都用 reactive 包裹，变成响应式对象
    // 如果说这个 res 值是一个对象的话，那么我们需要把获取到的 res 也转换成 reactive
    // res 等于 target[key]
    return reactive(res);
  }

  return res;
}

function createSetter(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  console.log("设置：", result);
  trigger(target, key);
  return result;
}

const mutableHandlers = {
  get: createGetter,
  set: createSetter,
};

export { mutableHandlers };
