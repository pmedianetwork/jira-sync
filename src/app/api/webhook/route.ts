import onPullRequestApproval from "@/helpers/onPullRequestApproval";
import onPullRequestReviewStarted from "@/helpers/onPullRequestReviewStarted";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const ghEventType = req.headers.get("x-github-event");

  const githubEvent = await req.json();

  switch (ghEventType) {
    case "pull_request_review":
      if (githubEvent.action !== "submitted") {
        return NextResponse.json({
          message: "Not a pull request review event",
        });
      }

      return NextResponse.json({
        message: "Success",
        issueKeys: await onPullRequestApproval(githubEvent),
      });

    /**
     * Note: Ideally, we would like this action to happen before the PR
     * review comment is submitted. However, as of now, GitHub does not
     * provide a way to do this. The next best thing is to do it after
     * the comment is submitted.
     */
    case "pull_request_review_comment":
      if (githubEvent.action !== "created") {
        return NextResponse.json({
          message: "Not a pull request review comment event",
        });
      }

      return NextResponse.json({
        message: "Success",
        issueKeys: await onPullRequestReviewStarted(githubEvent),
      });
    default:
      return NextResponse.json({
        message: "Not a valid event",
      });
  }
}
