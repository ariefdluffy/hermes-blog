module.exports = {
  apps: [
    {
      name: "hermes-blog",
      script: "./build/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        HOST: "0.0.0.0",
      },
      env_file: ".env",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
