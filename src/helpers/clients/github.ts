import { Octokit } from "octokit";

const githubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export default githubClient;
