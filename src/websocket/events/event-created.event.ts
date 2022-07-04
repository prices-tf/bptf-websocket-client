export class EventCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly payload: any,
  ) {}
}
