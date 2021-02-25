import {Contract} from 'ethers';
import {TypedEvent, TypedEventFilter} from '../typechain/commons';


export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
* General purpose async cold channel
* */
export class Channel<T> {
  private buckets: T[][] = [];
  private running = true;
  private onClearCb: (() => void) | null = null;

  public __write(msg: T) {
    this.buckets.forEach(bucket => bucket.push(msg));
  }

  public __onClear(cb: () => void) {
    this.onClearCb = cb;
  }

  public isRunning() {
    return this.running;
  }

  public clear() {
    this.running = false;
    this.buckets = [];

    if (this.onClearCb) this.onClearCb();
  }

  public instance(pollIntervalMs: number = 10): () => Promise<T | null> {
    const bucket: T[] = [];
    this.buckets.push(bucket);

    return async () => {
      while (this.running) {
        const obj = bucket.shift();
        if (obj) return obj;

        await delay(pollIntervalMs);
      }

      return null;
    };
  }
}

/*
* Get async channel instead of event-emitter for your contract's events!
* When stream ends, a channel instance returns undefined.
* WARNING! Always create only one event channel per unique EventFilter.
*
* Usage:
* const SomeEventChannel = createEventChannel<SomeEvent>(contract, filter);
* const getSomeEvent = SomeEventChannel.instance();
*
* while (SomeEventChannel.isRunning()) {
*   const ev = await getSomeEvent();
*   console.log(ev?.args);
* }
* */
export function createEventChannel<TArgsObj extends {} = {}, TArgsArr extends [] = []>(
  contractInstance: Contract,
  filter: TypedEventFilter<TArgsArr, TArgsObj>
): Channel<TypedEvent<TArgsArr & TArgsObj>> {
  const channel = new Channel();

  const listener = (...args: [TArgsArr[keyof TArgsArr], TypedEvent<TArgsArr & TArgsObj>]) => {
    channel.__write(args.pop());
  };

  contractInstance.on(filter, listener);
  channel.__onClear(() => contractInstance.off(filter, listener));

  return channel as Channel<TypedEvent<TArgsArr & TArgsObj>>;
}

/*
* Gets a channel instance and creates an async generator out of it.
* When steam ends, yields undefined.
*
* Usage:
*
* const gen = getEventChannelGeneratorInstance(SomeEventChannel);
* for await (let ev of gen) {
*   console.log(ev?.args)
* }
* */
export function* getEventChannelGeneratorInstance<T>(ch: Channel<T>, pollingIntervalMs: number = 10) {
  const getEvent = ch.instance(pollingIntervalMs);

  while (ch.isRunning()) {
    yield getEvent()
  }
}