import config from "../config";
import server from "./server";

const port = config.server.port;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`http://localhost:${port}`);
  console.log("Press CTRL-C to stop\n")
}
