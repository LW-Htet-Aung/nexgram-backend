export const toIdPlugin = (schema) => {
  const transform = (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  };
  schema.set("toJSON", { virtuals: true, transform });
  schema.set("toObject", { virtuals: true, transform });
};
