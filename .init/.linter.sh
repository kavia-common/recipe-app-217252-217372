#!/bin/bash
cd /home/kavia/workspace/code-generation/recipe-app-217252-217372/FrontendWebApplication
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

