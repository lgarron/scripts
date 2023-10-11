#!/usr/bin/env -S fish --no-config

function js_version
  if not test -f package.json
    return 1
  end
  set VERSION (cat package.json | jq -r ".version")
  echo -n "v$VERSION"
end

function rust_version
  if not test -f Cargo.toml
    return 1
  end

  set VERSION (cat Cargo.toml | toml2json | jq -r ".package.version")
  echo -n "v$VERSION"
end

function prev_js_version
  if not test -f package.json
    return 1
  end

  set VERSION (git show HEAD~:package.json | jq -r ".version")
  echo -n "v$VERSION"
end

function prev_rust_version
  if not test -f Cargo.toml
    return 1
  end

  set VERSION (git show HEAD~:Cargo.toml | toml2json | jq -r ".package.version")
  echo -n "v$VERSION"
end

if contains -- "--previous" $argv
  prev_js_version; or prev_rust_version
else
  js_version; or rust_version
end

