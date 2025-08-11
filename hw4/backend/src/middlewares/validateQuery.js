export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      value: issue.received || req.query[issue.path[0]],
    }));

    return res.status(400).json({ errors });
  }

  req.validatedQuery = result.data;
  next();
};
