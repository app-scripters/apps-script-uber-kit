#!/usr/bin/env bash

OLDDIR=`pwd`

cd $APPS_SCRIPT_UBER_KIT_ROOT

gulp build --app=$OLDDIR/src/$1

cd -