#!/usr/bin/env ts-node

import { generateServiceToken } from "../utils/service-token";

function printBanner(message: string): void {
  const border = "=".repeat(message.length + 4);
  console.log(border);
  console.log(`= ${message} =`);
  console.log(border);
}

(async () => {
  const { token, salt, hash } = generateServiceToken();
  const envValue = `${salt}:${hash}`;

  printBanner("Admin Service Token Generated");
  console.log("\nPlain token (store securely, e.g. as ADMIN_SERVICE_TOKEN in the admin app):\n");
  console.log(token);
  console.log("\nHash (store as ADMIN_SERVICE_TOKEN_HASH in the backend environment):\n");
  console.log(envValue);
  console.log("\nRotation guidance:\n - Update the backend secret ADMIN_SERVICE_TOKEN_HASH with the new hash.\n - Deploy backend before distributing the plain token.\n - Update the admin app's ADMIN_SERVICE_TOKEN secret last.\n");
})();
