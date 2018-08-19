#!/usr/bin/zsh -xe

WORK_DIR=/var/www/app/twitter-icon-classifier
REPOSITORY_URL=git@github.com:andooown/twitter-icon-classifier.git

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
# pipenv
export PIPENV_VENV_IN_PROJECT=true
eval "$(pipenv --completion)"

if [ -e ${WORK_DIR} ]; then
    cd ${WORK_DIR}
    git checkout master && git pull
else
    git clone ${REPOSITORY_URL} $WORK_DIR
    cd ${WORK_DIR}
fi

pipenv install
if [ -e uwsgi.pid ]; then
    if [ -x /proc/`cat uwsgi.pid` ]; then
        pipenv run stop
    fi
fi
(nohup pipenv run start >/dev/null 2>&1 &)
