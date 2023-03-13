import { ReactiveEffect } from './effect.js'
export class ComputedRefImpl {
  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      // scheduler
      // 当 effect 被触发的时候才将标识进行变动
      // 解锁后重新 get可以获取到最新的值
      if (this._dirty) return;
      this._dirty = true;
      // 触发依赖
      triggerRefValue(this)
    })

    this.dep = [];
    this._dirty = true;
    this._value = null;
  }
  get value() {
    // 收集依赖
    trackRefValue(this);
    // 当数据变化才进行修改 + 懒汉模式 yyds
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run()
    }
    return this._value;
  }

}