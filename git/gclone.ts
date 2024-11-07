#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { argv, exit } from "node:process";
import { $ } from "bun";

const git_repos_root = join(homedir(), "Code/git");
const repo_url_string: string | undefined = argv[2];

if (!repo_url_string) {
  const newLocal = "Usage: gclone https://github.com/account/repo";
  console.log(newLocal);
  exit(1);
}

// console.log(github_path, repo_url_string);
const url = new URL(repo_url_string);
if (url.protocol !== "https:") {
  console.error(`Invalid protocol (${url.protocol})`);
  exit(1);
}

const [_, user, repo] = url.pathname.split("/");
if (!user || !repo) {
  console.error(
    "URL is not long enough. Expected a user/org and repo name in the path.",
  );
  exit(1);
}

const repo_clone_source = new URL(join("/", user, repo), url).toString();
const repo_path_parent = join(git_repos_root, url.hostname, user);
const repo_path = join(repo_path_parent, repo);
console.log(repo_path);

if (existsSync(join(repo_path, ".git"))) {
  console.log("Repo already checked out!");
  console.log(repo_path);
} else if (existsSync(repo_path)) {
  console.log("Repo folder exists but is not a git repo?");
  console.log(repo_path);
} else {
  await mkdir(repo_path_parent, { recursive: true });
  console.log("Cloning from:", repo_clone_source);
  console.log("To:", repo_path);
  // Note: we do *not* `await` the result.
  Bun.spawn(["nohup", "git", "clone", repo_clone_source, repo_path], {
    stdout: "ignore",
    stderr: "ignore",
  });
}

async function retry(
  fn: () => Promise<void>,
  failureHandler: () => void,
  // biome-ignore lint/style/noInferrableTypes: Explicit types, man.
  millisecondsBetweenTries: number = 100,
  // biome-ignore lint/style/noInferrableTypes: Explicit types, man.
  numRetries: number = 100,
) {
  for (let i = 0; i < numRetries; i++) {
    if (existsSync(repo_path)) {
      await fn();
    }
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsBetweenTries),
    );
  }

  failureHandler();
}

retry(
  async () => {
    await Promise.all([await $`open ${repo_path}`, await $`code ${repo_path}`]);
    exit(0);
  },
  () => {
    throw new Error("Could not open repo folder.");
  },
);
