#! /bin/bash

rsync -av --progress ~/projects/MagPhyx ~/public_html/ --exclude .git --exclude .gitignore --exclude .DS_Store

rsync --delete -av ~/public_html edwajohn@www2.cose.isu.edu:~/
