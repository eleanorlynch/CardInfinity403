// each option will have a few things:
// a kind (NUMERICAL, NOMINAL, RADIO, CHECKBOX, CATEGORY)
// a name 
// an actual value
// EX: "maxNumRounds: number;" is  NUMERICAL, "maxNumRounds", then whatever value
// value MUST be stored here 

// This is a generic class, which means a type must be
// provided upon instantiating a new object.
// This is how we're going to handle options handling different data
export class Option<T> {
  name: string;
  value: T;
  kind: "NUMERICAL" | "NOMINAL" | "RADIO" | "CHECKBOX" | "CATEGORY";
  displayText: string;

  constructor(kind: "NUMERICAL" | "NOMINAL" | "RADIO" | "CHECKBOX" | "CATEGORY", name: string, value: T, displayText?: string) {
    this.kind = kind;
    this.name = name;
    this.value = value;
    this.displayText = displayText ?? String(value);
  }
}