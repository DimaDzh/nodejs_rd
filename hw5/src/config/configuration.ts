export default () => ({
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
});