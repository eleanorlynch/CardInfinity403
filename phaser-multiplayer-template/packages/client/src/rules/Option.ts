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

  constructor(name: string, value: T) {
    this.name = name;
    this.value = value;

    // oh lord
    // get ready for the world's worst conditional
    // TODO: this is very flawed rn for obvious reasons.
    // dies to enums
    if (value instanceof Number) {
      this.kind = "NUMERICAL";
    } else if (value instanceof String) {
      this.kind = "NOMINAL";
    } else {
      this.kind = "RADIO";
    }

  }

}
