import githubClient from "./clients/github";
import _ from "lodash";

export const allPRApprovers = async (github_event: any) => {
  const { data } = await githubClient(global.installationId).request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
    {
      owner: github_event.repository.owner.login,
      repo: github_event.repository.name,
      pull_number: github_event.pull_request.number,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const allApprovers = data.reduce((acc: any, curr: any) => {
    if (curr.state === "APPROVED") {
      acc.push(curr.user.login);
    }

    return acc;
  }, []);

  return _.uniq(allApprovers);
};

interface getCommitsFromEventProps {
  owner: string;
  repo: string;
  pull_number: number;
}
export const getCommitsFromEvent = async ({
  owner,
  repo,
  pull_number,
}: getCommitsFromEventProps) => {
  const { data } = await githubClient(global.installationId).request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
    {
      owner,
      repo,
      pull_number,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const commitsString = data.map((c) => c.commit.message).join(" ");

  return commitsString;
};

export const getPullRequest = async (
  pr_number: number,
  owner: string,
  repo: string
) => {
  const { data } = await githubClient(global.installationId).request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pr_number,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return data;
};

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
