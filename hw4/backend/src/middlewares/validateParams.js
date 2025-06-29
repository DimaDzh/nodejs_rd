export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return res
      .status(400)
      .json({ errors: result.error.format(), where: "params" });
  }

  req.params = result.data;
  next();
};
