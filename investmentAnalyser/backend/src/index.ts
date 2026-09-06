/**
 * Entry point for the application.
 */

import { app, PORT } from "./app";

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});
