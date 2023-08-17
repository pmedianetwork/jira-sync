import JiraApi from "jira-client";

const jiraClient = new JiraApi({
  protocol: "https",
  host: "adverity.atlassian.net",
  strictSSL: true,
  apiVersion: "2",
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
});

export default jiraClient;
