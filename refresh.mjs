import {valid} from './model.mjs';

export function createPoller({load, update, now = Date.now}) {
  let dataset, state = 'checking', next = 0, pending, checked = false;
  const notify = () => update({dataset,state,next,checked});
  const check = (manual = false) => {
    if (pending || (!manual && now() < next) || (manual && checked && now() < next - 55000)) return pending;
    state = 'checking';
    pending = Promise.resolve().then(load).then(result => {
      if (!valid(result)) throw new Error('Aggregate validation failed');
      const changed = dataset?.dataset_version !== result.dataset_version;
      dataset = changed ? result : {...result,cells:dataset.cells};
      state = result.stale === true ? 'stale' : 'connected';
    }).catch(() => { state = dataset ? 'stale' : 'unavailable'; }).finally(() => {
      next = now() + 60000;
      checked = true;
      pending = undefined;
      notify();
    });
    notify();
    return pending;
  };
  return {check, tick: () => {check(); notify();}};
}
