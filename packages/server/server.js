const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const server = http.createServer(app);
const PORT = 3001;
app.use(cors());

socketInit(server);
server = app.listen(PORT, () => {
    logger.debug(`[HTTP] Soda Server is started on port : ` + PORT);
});
