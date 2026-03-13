import { createServer } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
const app = createServer();

app.listen(config.port, () => {
  console.log(`members-service listening on port ${config.port}`);
});
