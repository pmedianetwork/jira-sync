import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";

const privateKey = fs.readFileSync("./jira-sync-app.private-key.pem", "utf8");

const githubClient = (installationId: string) =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      clientId: process.env.GITHUB_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
      privateKey,
      installationId,
    },
  });

export default githubClient;
