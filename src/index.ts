require("dotenv").config();

global.sampleVariable = "Foo bar baz";

const sampleObject: SampleType = {
  bar: "Foo bar baz",
};

console.log("Hello world!", sampleObject);
