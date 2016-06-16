#!/usr/bin/env bash

OLDDIR=`pwd`

#restore write access to make Gulp write to it
chmod a+w -R $OLDDIR/$1/build

cd $APPS_SCRIPT_UBER_KIT_ROOT

gulp build --app=$OLDDIR/$1

#protect from occasional mis-edit
chmod a-w -R $OLDDIR/$1/build

cd -