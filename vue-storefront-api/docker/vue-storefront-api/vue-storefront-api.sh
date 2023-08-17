#!/bin/sh
set -e

yarn install || exit $?

yarn restore || exit $?

if [ "$VS_ENV" = 'dev' ]; then
  yarn dev
else
  yarn start
fi
