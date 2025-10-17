// NextAuth.js debug file - automatically imported at the beginning of the NextAuth setup

// Check for required environment variables
const requiredVars = {
  "GITHUB_ID": process.env.GITHUB_ID,
  "GITHUB_SECRET": process.env.GITHUB_SECRET,
  "NEXTAUTH_SECRET": process.env.NEXTAUTH_SECRET,
  "MONGODB_URI": process.env.MONGODB_URI,
};

// Optional environment variables
const optionalVars = {
  "NEXTAUTH_URL": process.env.NEXTAUTH_URL,
  "NODE_ENV": process.env.NODE_ENV,
};

// Print debug information
console.log("\n===== NEXTAUTH DEBUG INFORMATION =====");
console.log(`NextAuth Initialization at ${new Date().toISOString()}`);
console.log("\nRequired Environment Variables:");

// Check required variables
const missingVars = [];
for (const [key, value] of Object.entries(requiredVars)) {
  const status = value ? "✓ Set" : "✗ Not set";
  console.log(`  ${key}: ${status}`);
  if (!value) missingVars.push(key);
}

// Check optional variables
console.log("\nOptional Environment Variables:");
for (const [key, value] of Object.entries(optionalVars)) {
  console.log(`  ${key}: ${value ? value : "Not set"}`);
}

// Print warning for missing variables
if (missingVars.length > 0) {
  console.log("\n⚠️ WARNING: Missing required environment variables:");
  missingVars.forEach(v => console.log(`  - ${v}`));
  console.log("\nAuthentication may not work correctly without these variables!");
}

console.log("\nSession Configuration:");
console.log(`  Strategy: JWT (Token stored in HTTP-only cookie)`);
console.log(`  Max Age: 30 days`);

console.log("\nDebug Mode:", process.env.NODE_ENV === "development" ? "Enabled" : "Disabled");
console.log("=======================================\n");