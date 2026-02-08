export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT ?? '3000', 10),

  orderExpiryHours: parseInt(
    process.env.ORDER_EXPIRY_HOURS ?? '24',
    10,
  ),
});
