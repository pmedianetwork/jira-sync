import _ from "lodash";
import jiraClient from "./clients/jira";
import JiraApi from "jira-client";

const preprocessString = (str: string) => {
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const tmpl = _.template(str);

  return tmpl({ event: {} });
};

const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;

export const findIssueKeyIn = async (searchStr: string) => {
  const match = searchStr.match(issueIdRegEx);

  if (!match) {
    console.log(`String does not contain issueKeys`);

    return [];
  }

  const uniqueEntries = _.uniq(match);

  const issueKeys: JiraApi.JsonResponse[] = [];

  // Validate that the issue exists
  for (const issueKey of uniqueEntries) {
    let issue;
    try {
      issue = await jiraClient.getIssue(issueKey);

      if (issue) {
        issueKeys.push(issue);
      }
    } catch (error) {
      console.log(error);
      console.log(`Issue ${issueKey} not found`);
    }
  }

  return issueKeys;
};

interface getIssueKeyProps {
  commits: any;
  title: string;
  description: string;
}

const getIssueKey = async ({
  commits,
  title,
  description,
}: getIssueKeyProps) => {
  const searchString = [commits, title, description].join(" ");

  const preprocessed = preprocessString(searchString);

  const issueKeys = await findIssueKeyIn(preprocessed);

  return issueKeys;
};

export { getIssueKey };
