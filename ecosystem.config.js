module.exports = {
  apps: [
    {
      name: 'INDUSTRIAL',
      script: './index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
    },
  ],
};
