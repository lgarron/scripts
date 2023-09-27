#!/bin/bash

set -e

if [ "$#" -lt "1" ]; then
	SCRIPT_NAME=$(basename "${0}")
	echo "Converts a video file into a new version on the border of strong compression and minimal visual difference."
	exit 1
fi

OUT_FILE="${2}"

if [ -z "${OUT_FILE}" ]; then
	OUT_FILE="${1}.hevc.preset-medium.crf18.mp4"
fi

if [ -f "${OUT_FILE}" ]; then
	echo "${OUT_FILE} already exists."
	exit 1
fi

nice -n 20 \
	ffmpeg \
    -i "${1}" \
    -c:v libx265 \
    -preset medium \
    -crf 18 \
    -c:a aac \
    -b:a 128k \
    -tag:v hvc1 \
    -vf scale=out_color_matrix=bt709 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    "${OUT_FILE}" \
  && touch -r "${1}" "${OUT_FILE}"

#    -vf scale=out_color_matrix=bt709 -color_primaries bt709 -color_trc bt709
#    -colorspace bt709 \ # https://stackoverflow.com/a/53806290
