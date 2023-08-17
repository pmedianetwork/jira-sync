import jira from "./clients/jira";
import { STATUS_IDS, TRANSITION_IDS } from "./config";
import { getIssueKey } from "./getIssueKey";
import { allPRApprovers, getCommitsFromEvent } from "./utils";
import _ from "lodash";

async function onPullRequestApproval(githubEvent: any) {
  const commits = await getCommitsFromEvent({
    owner: githubEvent.repository.owner.login,
    repo: githubEvent.repository.name,
    pull_number: githubEvent.pull_request.number,
  });

  const issues = await getIssueKey({
    commits,
    title: githubEvent.pull_request.title,
    description: githubEvent.pull_request.body,
  });

  const allApprovers = await allPRApprovers(githubEvent);

  if (issues.length === 0) {
    console.log("No JIRA issues found");

    return;
  }

  const updatedIssues = [];

  for (const issue of issues) {
    // If the issue is in "In Development" status, transition to "In Code Review"
    if (allApprovers.length === 0) {
      if (issue.fields.status.id === STATUS_IDS.READY_FOR_CODE_REVIEW) {
        continue;
      }

      // PR comment issued = review started
      const comment = `[Pull Request] Review started by ${githubEvent.review.user.login}`;

      console.log(
        `[${issue.key}] ${issue.fields.status.id} ${issue.fields.status.name}`
      );

      const availableTransitions = await jira.listTransitions(issue.key);

      const inCodeReview = _.find(availableTransitions.transitions, {
        id: TRANSITION_IDS.TO_CODE_REVIEW,
      });

      if (!inCodeReview) {
        console.log(`[${issue.key}] Transition not available`);

        continue;
      }

      await jira.addComment(issue.key, comment);

      await jira.transitionIssue(issue.key, {
        transition: {
          id: TRANSITION_IDS.TO_CODE_REVIEW,
        },
      });
    }

    if (allApprovers.length === 1) {
      // PR approved by 1 person, notify JIRA
      const comment = `[Pull Request] First approval by ${allApprovers.join(
        ", "
      )}`;

      // If the issue is in "Ready for code review" status, transition to "In Code Review"
      if (issue.fields.status.id === STATUS_IDS.READY_FOR_CODE_REVIEW) {
        const availableTransitions = await jira.listTransitions(issue.key);

        const inCodeReview = _.find(availableTransitions.transitions, {
          id: TRANSITION_IDS.TO_CODE_REVIEW,
        });

        if (!inCodeReview) {
          console.log(`[${issue.key}] Transition not available`);

          continue;
        }

        console.log(`[${issue.key}] Transitioning to In Code Review`);

        await jira.addComment(issue.key, comment);

        await jira.transitionIssue(issue.key, {
          transition: {
            id: TRANSITION_IDS.TO_CODE_REVIEW,
          },
        });
      }

      updatedIssues.push(issue);
    }

    if (allApprovers.length === 2) {
      // PR approved by 2 people, notify JIRA
      const comment = `[Pull request] Fully approved by ${allApprovers.join(
        " & "
      )}.`;

      await jira.addComment(issue.key, comment);

      const availableTransitions = await jira.listTransitions(issue.key);

      const readyForQa = _.find(availableTransitions.transitions, {
        id: TRANSITION_IDS.READY_FOR_QA,
      });

      if (!readyForQa) {
        console.log(`[${issue.key}] Transition not available`);

        continue;
      }

      await jira.transitionIssue(issue.key, {
        transition: {
          id: TRANSITION_IDS.READY_FOR_QA,
        },
      });

      await jira.addComment(issue.key, comment);

      updatedIssues.push(issue);
    }
  }

  return updatedIssues;
}

export default onPullRequestApproval;
