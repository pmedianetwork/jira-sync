import onPullRequestAction from "@/helpers/onPullRequestAction";
import onReleaseAction from "@/helpers/onReleaseAction";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const ghEventType = req.headers.get("x-github-event");

  if (!ghEventType) {
    return NextResponse.json({
      message: "Not a valid event",
    });
  }

  const githubEvent = await req.json();

  if (!githubEvent.installation) {
    return NextResponse.json({
      message: "Not a valid event",
    });
  }

  // We store the installation ID in a global variable so that we
  // can use it in other functions.
  global.installationId = githubEvent.installation.id;

  switch (ghEventType) {
    case "pull_request_review":
      if (githubEvent.action !== "submitted") {
        return NextResponse.json({
          message: "Not a pull request review event",
        });
      }

      return NextResponse.json({
        message: "Success",
        issueKeys: await onPullRequestAction(githubEvent),
      });

    case "release":
      if (githubEvent.action !== "published") {
        return NextResponse.json({
          message: "Not a valid release event",
        });
      }

      return NextResponse.json({
        message: "Success",
        issueKeys: await onReleaseAction(githubEvent),
      });

    default:
      return NextResponse.json({
        message: "Not a valid event",
      });
  }
}
