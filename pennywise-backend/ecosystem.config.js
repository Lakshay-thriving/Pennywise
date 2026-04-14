module.exports = {
  apps : [{
    name   : "pennywise-backend",
    script : "./index.js",
    watch  : true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
