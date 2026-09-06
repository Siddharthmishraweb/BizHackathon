"use strict";
/**
 * Entry point for the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
app_1.app.listen(app_1.PORT, () => {
    console.log(`Backend listening on http://localhost:${app_1.PORT}`);
    console.log(`API available at http://localhost:${app_1.PORT}/api/v1`);
});
