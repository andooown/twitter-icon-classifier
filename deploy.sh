WORK_DIR=/var/www/app/twitter-icon-classifier

cd ${WORK_DIR}
git checkout master && git pull

pipenv run stop
pipenv install
pipenv run start &
