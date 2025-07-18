#!/bin/bash
cd /home/kavia/workspace/code-generation/online-tic-tac-toe-e8265770/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

