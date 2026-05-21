// PM2 ecosystem for CyberAutopsy production.
// Start with:  pm2 start deploy/ecosystem.config.js
// Reload with: pm2 reload all

module.exports = {
  apps: [
    {
      name: "cyberautopsy-site",
      cwd: "./cyberautopsy-site",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      error_file: "/home/cyber/.pm2/logs/cyberautopsy-site-error.log",
      out_file: "/home/cyber/.pm2/logs/cyberautopsy-site-out.log",
      merge_logs: true,
      time: true
    },
    {
      name: "cyberautopsy-portal",
      cwd: "./cyberautopsy-portal",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3100"
      },
      error_file: "/home/cyber/.pm2/logs/cyberautopsy-portal-error.log",
      out_file: "/home/cyber/.pm2/logs/cyberautopsy-portal-out.log",
      merge_logs: true,
      time: true
    }
  ]
};
