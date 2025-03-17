export class Environment {
  private locations: Map<string, Location> = new Map();
  
  constructor() {
    // Initialize with default locations
    this.addLocation({
      id: "home",
      name: "Home",
      type: "residential",
      capacity: 4
    });
    
    this.addLocation({
      id: "office",
      name: "Office Building",
      type: "workplace",
      capacity: 50
    });
    
    this.addLocation({
      id: "park",
      name: "Central Park",
      type: "recreation",
      capacity: 100
    });
    
    this.addLocation({
      id: "cafe",
      name: "Coffee Shop",
      type: "commercial",
      capacity: 20
    });
  }
  
  public addLocation(location: Location): void {
    this.locations.set(location.id, location);
  }
  
  public getLocation(locationId: string): Location | undefined {
    return this.locations.get(locationId);
  }
  
  public getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }
}

interface Location {
  id: string;
  name: string;
  type: "residential" | "workplace" | "recreation" | "commercial" | "other";
  capacity: number;
  occupants?: string[]; // Agent IDs
} 