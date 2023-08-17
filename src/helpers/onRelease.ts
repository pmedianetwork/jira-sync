import _ from "lodash";
import jiraClient from "./clients/jira";
import { STATUS_IDS, TRANSITION_IDS } from "./config";
import { getIssueKey } from "./getIssueKey";
import { getCommitsFromEvent, getPullRequest } from "./utils";

async function onRelease(githubEvent: any) {
  console.log("onRelease", githubEvent);

  return;
}

export default onRelease;
