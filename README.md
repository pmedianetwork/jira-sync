# Jira Sync Webhook API

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, ensure you have the right environment variables set up. You can copy the `.env.example` file to `.env.local` and fill in the values.

### Docker and environment variables

In case you are using Docker, the environment variables will be picked up from your `.env` file. So, in this case, the same rules apply as without the docker.

Then, install the dependencies:

```bash
yarn dev
```

You can interact with the API using the /api/webhook endpoint.

This API route is designed to handle GitHub webhook events, specifically for pull request reviews and releases. Depending on the type of GitHub event received, it will trigger different functions (onPullRequestAction or onReleaseAction) to process the event and return a response.

The specific Github events it cares about are:

- `pull_request_review` events
- `release` events

### Request Headers

- `x-github-event`: Specifies the type of GitHub event. This route specifically handles `pull_request_review` and `release` events.

### Request Body

The request body should contain the raw payload of the GitHub event.

## Transitions on `pull_request_review` event

This event is handled in `onPullRequestAction` function which is responsible for taking care of transitions of JIRA issues based on actions taken on a GitHub pull request. Here are the transitions that the function manages:

### Start of Review Process:

**Trigger**: The function assumes that the first comment on a pull request signifies the start of the review process.
**Condition**: The JIRA issue has no approvers.
**Actions**:

- If the JIRA issue is in the "_Ready for Code Review_" status, transition it to the "_In Code Review_" status.
- Add a comment to the JIRA issue indicating that the review has started.
- JIRA Comment Format: _[Pull Request] Review started by [GitHub Reviewer's Username]_

### First PR Approval:

**Trigger**: The pull request receives its first approval.
**Condition**: The JIRA issue is in the "_Ready for Code Review_" status.
**Actions**:

- Transition the JIRA issue to the "_In Code Review_" status.
- Add a comment to the JIRA issue indicating the first approval.
- JIRA Comment Format: _[Pull Request] Review started by [GitHub Reviewer's Username]_

### Second PR Approval:

**Trigger**: The pull request receives its second approval.
**Condition**: The function assumes that by this point, the JIRA issue is already in the "_In Code Review_" status.
**Actions**:

- Add a comment to the JIRA issue indicating the second approval.
- Transition the JIRA issue to the "_Ready for QA_" status.
- JIRA Comment Format: _[Pull request] Fully approved by [Approver 1] & [Approver 2]_

## Transitions on `release` event

The `onReleaseAction` function manages transitions of JIRA issues based on the release action in a GitHub repository. Here are the transitions that the function manages:

### Release Process:

**Trigger**: A release action on GitHub.
**Condition**: The release body contains JIRA issue keys.
**Actions**:

- Transition the JIRA issue to the "_Done/Released_" status.
- Add a comment to the JIRA issue indicating the release version.
- JIRA Comment Format: _Released in version: [GitHub Release Version]_
