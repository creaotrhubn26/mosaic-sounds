// Vercel function entry — exports the Express app directly so Vercel can invoke
// it as a request handler. Does NOT call app.listen() (that's only used for the
// standalone Node server in src/index.ts).
import app from "./app";

export default app;
