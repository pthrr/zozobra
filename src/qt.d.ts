declare interface Signal<T> {
  connect(callback: T): void;
  disconnect(callback: T): void;
}
declare namespace Qt {
  class QUuid {}
}
