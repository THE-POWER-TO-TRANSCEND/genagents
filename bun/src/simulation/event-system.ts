import { TimeSystem } from './time-system';
import { v4 as uuidv4 } from 'uuid';

export interface SimulationEvent {
  id: string;
  type: string;
  time: number; // When the event should occur
  data: any; // Event-specific data
  callback: (data: any) => Promise<void>;
}

export class EventSystem {
  private events: SimulationEvent[] = [];
  
  constructor(
    private timeSystem: TimeSystem
  ) {}
  
  public scheduleEvent(
    type: string,
    delay: number, // Milliseconds from now
    data: any,
    callback: (data: any) => Promise<void>
  ): string {
    const eventId = uuidv4();
    const eventTime = this.timeSystem.getCurrentTime() + delay;
    
    const event: SimulationEvent = {
      id: eventId,
      type,
      time: eventTime,
      data,
      callback
    };
    
    this.events.push(event);
    
    // Sort events by time
    this.events.sort((a, b) => a.time - b.time);
    
    return eventId;
  }
  
  public cancelEvent(eventId: string): boolean {
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.id !== eventId);
    return this.events.length < initialLength;
  }
  
  public async processEvents(): Promise<void> {
    const currentTime = this.timeSystem.getCurrentTime();
    const dueEvents = this.events.filter(event => event.time <= currentTime);
    
    // Remove due events from the queue
    this.events = this.events.filter(event => event.time > currentTime);
    
    // Process each due event
    for (const event of dueEvents) {
      try {
        await event.callback(event.data);
      } catch (error) {
        console.error(`Error processing event ${event.id} of type ${event.type}:`, error);
      }
    }
  }
  
  public getUpcomingEvents(limit: number = 10): SimulationEvent[] {
    return [...this.events].slice(0, limit);
  }
} 