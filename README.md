# [`lgarron`](https://github.com/lgarron)'s scripts

Many scripts can be installed using: <https://github.com/lgarron/homebrew-lgarron/>

Many scripts are also written in [`fish`](https://fishshell.com/).

## app-tools
### `editor-open`
Open a Markdown file in either Obsidian (if in a relevant folder) or VSCode.
### `restart-qs`
Restart [Quicksilver](https://qsapp.com/).
## audio
### `flacify`
Convert to `flac`
### `mp3ify`
Convert to `.mp3` with high (but not maximum) quality.
### `wavify`
Convert to `.wav`
## git
### `gclone`
Clone the given URL to `~/Code/git/github.com/[user]/[repo]/`. Useful to combine with `chrometab`, or [using QS](https://github.com/lgarron/dotfiles/blob/f5b435e3701988b070920ef1f31ef6afb2384ca8/Quicksilver%20Triggers/Google/Clone%20GitHub%20Repo%20from%20Chrome.applescript).
### `git-distance`[^2]
Calculate the distance from the current branch (or any branch) to another branch, in terms of # of unique commits on each since the last common ancestor.
### `node_crunchule`
Compress any `node_modules` in the current or ancestor folders (useful to reduce the number of files on disk for a dormant repo, which can make system backups faster to diff).
## graphics
### `jpeg-optimize`
Optimise a single file using `jpeg-recompress`.
### `jpeg-optimize-all`
Optimise all `.jpg` files in the current folder using `jpeg-recompress`.
### `jpegrescan`
A script to optimize JPEGs, by Loren Merritt
### `jpgcrush`
A script to optimize JPEGs, by Loren Merritt.
### `whiteboard`
Convert an image into an optimized black-and-white file using [this gist by Leland Batey](https://gist.github.com/lelandbatey/8677901).
## maestral
### `dbx-link`
Copy a link to the given path (relative to the current working dir, or absolute), creating it if needed.
### `dbx-web`
Open a link to the given path (relative to the current working dir, or absolute) on the Dropbox website in the browser.
## pack
### `pack-logs`
Pack argument files into a `logs.7z` file. Example: `pack-logs *.log`
### `pack-pov`
Pack `.bmp` or `.png` files in a folder. Example: `pack-pov cube?????.png`
## storage
### `dmgify`
Create a `.dmg` out of a folder. Can be as useful as a `.zip` file, but allows mounting and editing in macOS without any special tools. Example: `dmgify ./path/to/folder`
## system
### `assign-icon`
Assign an icon file to a file/folder.
### `config-touch-id-sudo`
Enable Touch ID for sudo commands in shells by adding `pam_tid.so` to `/private/etc/pam.d/sudo`. Useful after every macOS update. Example: `config-touch-id-sudo enable`
### `map`
Super simple parallization scripts. Example: `map process file1.txt file2.txt`
### `portkill`
Run `kill -9` for any processes using a given port. Example: `portkill 8000`
### `symlink-replace`
Replace a symlink with its target.
### `toggle-retina`
Toggle Retina display scaling. Requires [RDM](https://github.com/avibrazil/RDM) to be installed.
### `unixtime`
Print the current unix time in seconds. Equivalent to `date +%s` but easier to remember.
## video
### `archive-h265-crf18`
Archive a video using H.265 at CRF 18 (moderately high quality setting).
### `archive-mp4-crf18`
Archive a video using MP4 at CRF 18 (moderately high quality setting).
### `mts2mov`
Wraps RX100 AVCHD files into `.mov` so that macOS will read natively, without transcoding the video stream.
## web
### `add-rome`
Install and configure [`rome`](https://rome.tools/) for a JS repo with my legacy defaults.
### `chrometab`
Get the current open Chrome tab.
### `npm-cost`
Calculate the cost of a given `npm` module by number of files and disk size, without modifying the current folder.
### `safaritab`
Get the current open Safari tab.
### `ts`
Bundles and runs the given entry file using [`esbuild`](https://esbuild.github.io/).
### `weblocify`
Create a `.webloc` file for the given URL. Example (using `chrometab` in `fish`): `weblocify (chrometab) bookmark-file.webloc`
### `ytflac`
Use `youtube-dl` to get a `.flac` file for a URL.
### `ytmp3`
Use `youtube-dl` to get a `.mp3` file for a URL.
