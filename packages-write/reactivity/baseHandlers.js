import { track, trigger } from "./effect.js";

function createGetter(target, key, receiver) {
  track(target, key);
  return Reflect.get(target, key, receiver);
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
