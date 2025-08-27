export interface EventPublisher {
  publish(eventName: string, payload: any): Promise<void>;
}
