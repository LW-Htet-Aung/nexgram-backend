import mongoose from "mongoose";

export const toIdPlugin = (schema) => {
  const transform = (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  };
  schema.set("toJSON", { virtual: true, transform });
  schema.set("toObject", { virtual: true, transform });
};

mongoose.plugin(toIdPlugin);
