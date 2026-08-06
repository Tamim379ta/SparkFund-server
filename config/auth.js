const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.CLIENT_URL,
    "http://localhost:3000",
  ],
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  advanced: {
    crossSubdomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "supporter",
      },
      credits: {
        type: "number",
        defaultValue: 50,
      },
    },
  },
});