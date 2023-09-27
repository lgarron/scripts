#!/bin/bash

set -e

if [ "$#" -lt "1" ]; then
	SCRIPT_NAME=$(basename "${0}")
	echo "Converts a video file into a new version on the border of strong compression and minimal visual difference."
	exit 1
fi

OUT_FILE="${2}"

if [ -z "${OUT_FILE}" ]; then
	OUT_FILE="${1}.crf18.mp4"
fi

if [ -f "${OUT_FILE}" ]; then
	echo "${OUT_FILE} already exists."
	exit 1
fi

nice -n 20 \
	ffmpeg -i "${1}" -c:v libx264 -preset veryslow -crf 18 "${OUT_FILE}" && touch -r "${1}" "${OUT_FILE}"
