import _ from "lodash";
import jiraClient from "./clients/jira";
import { STATUS_IDS, TRANSITION_IDS } from "./config";
import { getIssueKey } from "./getIssueKey";
import { getCommitsFromEvent, getPullRequest } from "./utils";

async function onPullRequestReviewStarted(githubEvent: any) {
  const pullRequest = await getPullRequest(
    githubEvent.pull_request.number,
    githubEvent.repository.owner.login,
    githubEvent.repository.name
  );

  if (!pullRequest.head.repo) {
    console.log("No head repo found");

    return;
  }

  const commits = await getCommitsFromEvent({
    owner: pullRequest.head.repo?.owner.login,
    repo: pullRequest.head.repo?.name,
    pull_number: pullRequest.number,
  });

  const issues = await getIssueKey({
    commits,
    title: pullRequest.title,
    description: pullRequest.body || "",
  });

  if (issues.length === 0) {
    console.log("No JIRA issues found");

    return;
  }

  const updatedIssues = [];

  for (const issue of issues) {
    // If the issue is in "In Development" status, transition to "In Code Review"
    if (issue.fields.status.id !== STATUS_IDS.IN_DEVELOPMENT) {
      console.log(`[${issue.key}] Transition not available`);
      continue;
    }

    const availableTransitions = await jiraClient.listTransitions(issue.key);

    const inCodeReview = _.find(availableTransitions.transitions, {
      id: TRANSITION_IDS.IN_CODE_REVIEW,
    });

    if (!inCodeReview) {
      console.log(`[${issue.key}] Transition not available`);
      continue;
    }

    console.log(`[${issue.key}] Transitioning to In Code Review`);

    // await jira.transitionIssue(issueKey, {
    //   transition: {
    // id: TRANSITION_IDS.READY_FOR_QA,
    //   },
    // });

    // await jira.addComment(issue.key, comment);

    updatedIssues.push(issue);
  }

  return updatedIssues;
}

export default onPullRequestReviewStarted;
