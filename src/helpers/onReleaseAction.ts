import _ from "lodash";
import jiraClient from "./clients/jira";
import { TRANSITION_IDS } from "./config";
import { findIssueKeyIn } from "./getIssueKey";

async function onReleaseAction(githubEvent: any) {
  const issues = await findIssueKeyIn(githubEvent.release.body);

  const releaseVersion = githubEvent.release.tag_name;

  if (_.isEmpty(issues)) {
    console.log("No issue keys found in release body");

    return [];
  }

  const updatedIssues: any = [];

  // Go trough each released issue and transition it to "To Release"
  for (const issue of issues) {
    const availableTransitions = await jiraClient.listTransitions(issue.key);

    const toRelease = _.find(availableTransitions.transitions, {
      id: TRANSITION_IDS.TO_RELEASED,
    });

    if (!toRelease) {
      console.log(`[${issue.key}] Transition not available`);

      continue;
    }

    await jiraClient.transitionIssue(issue.key, {
      transition: {
        id: TRANSITION_IDS.TO_RELEASED,
      },
    });

    const updatedIssue = await jiraClient.addComment(
      issue.key,
      `Released in version: ${releaseVersion}}`
    );

    updatedIssues.push(updatedIssue);
  }

  return updatedIssues;
}

export default onReleaseAction;
