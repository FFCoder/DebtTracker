import { ExtractJwt } from "passport-jwt";

export default {
  JWT: {
    secretOrKey: process.env.JWT_SECRET || "secret key totally secure",
    jwtFromRequest: (req: any) => {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      } else if (req.body && req.body.token) {
        return req.body.token;
      }
      return null;
    },
    issuer: process.env.JWT_ISSUER || "localhost",
  },
  server: {
    port: process.env.PORT || 8888,
  },
  db: {
    path: process.env.DB_PATH || "sqlite::memory:",
  },
};
