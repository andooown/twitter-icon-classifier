# -*- coding: utf-8 -*-

from bottle import run, route, HTTPResponse, default_app
import tweepy
import argparse
import json
import os

URL_PREFIX = '/app/twitter-icon-classifier/api'

CONSUMER_KEY = os.environ['TWITTER_CONSUMER_KEY']
CONSUMER_SECRET = os.environ['TWITTER_CONSUMER_SECRET']
ACCESS_TOKEN_KEY = os.environ['TWITTER_ACCESS_TOKEN_KEY']
ACCESS_TOKEN_SECRET = os.environ['TWITTER_ACCESS_TOKEN_SECRET']


auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)
api = tweepy.API(auth)


def create_json_response(data):
    body = json.dumps(data, ensure_ascii=True)
    
    response = HTTPResponse(status=200, body=body)
    response.set_header("Content-Type", "application/json")

    return response


@route(URL_PREFIX + '/get_icon_url/<screen_name>')
def get_icon_url(screen_name):
    if not screen_name:
        print('[ERROR] screen_name is None.')
        return create_json_response({'success': False})

    try:
        user = api.get_user(screen_name=screen_name)
    except Exception:
        print('[ERROR] The user "{}" is not found.'.format(screen_name))
        return create_json_response({'success': False})
    url = user.profile_image_url_https.replace('_normal', '')

    return create_json_response({'success': True, 'url': url})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', type=int, required=True)
    parser.add_argument('-d', '--debug', action='store_true')
    args = parser.parse_args()

    run(server='waitress', host='localhost', port=args.port, debug=args.debug)
else:
    application = default_app()
