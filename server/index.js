const { buildServer } = require('./src/server');

const PORT = process.env.PORT || 3001;
const { server } = buildServer();

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
