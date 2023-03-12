// 需要 effect 将监听的方法进行存储
let activeEffect;
// 维护一个 dep 存放 _fn
let targetMap = new Map();
class ReactiveEffect {
  deps = [];
  active = true;

  constructor(fun) {
    this.fun = fun;
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
  if (!activeEffect) return;
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

  if (!dep.includes(activeEffect)) {
    dep.push(activeEffect);
    activeEffect.deps.push(activeEffect);
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key) || [];
  dep.forEach((_effect) => _effect.run());
}
