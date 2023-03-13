// 需要 effect 将监听的方法进行存储
let activeEffect;
// 维护一个 dep 存放 _fn
let targetMap = new Map();
export class ReactiveEffect {
  deps = [];
  active = true;

  constructor(fun, scheduler) {
    this.fun = fun;
    this.scheduler = scheduler;
  }
  run() {
    // 执行 fn  但是不收集依赖
    if (!this.active) {
      return this.fn();
    }

    activeEffect = this;
    const result = this.fun();
    activeEffect = null;

    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  // 找到所有依赖这个 effect 的响应式对象
  // 从这些响应式对象里面把 effect 给删除掉
  effect.deps.forEach((dep) => {
    dep.splice(dep.indexOf(effect), 1);
  });

  effect.deps.length = 0;
}

export function effect(fun) {
  const _effect = new ReactiveEffect(fun);
  _effect.run();

  // 把 _effect.run 这个方法返回
  // 让用户可以自行选择调用的时机（调用 fn）
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function track(target, key) {
  if (!isTracking()) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 初始化 depsMap 的逻辑
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);

  if (!dep) {
    dep = [];
    depsMap.set(key, dep);
  }

  trackEffects(dep)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key) || [];
  triggerEffects(dep)
}


export function trackEffects(dep) {
  // 用 dep 来存放所有的 effect

  // TODO
  // 这里是一个优化点
  // 先看看这个依赖是不是已经收集了，
  // 已经收集的话，那么就不需要在收集一次了
  // 可能会影响 code path change 的情况
  // 需要每次都 cleanupEffect
  // shouldTrack = !dep.has(activeEffect!);
  if (!dep.includes(activeEffect)) {
    dep.push(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function isTracking() {
  return activeEffect
}

export function triggerEffects(dep) {
  dep.forEach((_effect) => _effect.scheduler
    ? _effect.scheduler()
    : _effect.run());
}
