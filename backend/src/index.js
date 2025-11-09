const { buildServer } = require('./server');
const { PORT } = require('./config');
const { server } = buildServer();

const srv = server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

function shutdown(sig) {
  console.log('Shutdown', sig);
  srv.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
