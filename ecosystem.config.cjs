module.exports = {
  apps: [
    {
      name: "x-ringsupply-manager",
      script: "npm run start",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
