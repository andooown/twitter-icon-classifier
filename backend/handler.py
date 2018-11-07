import boto3
import tweepy
import json

ssm_client = boto3.client('ssm')


def get_secret(key):
	response = ssm_client.get_parameter(Name=key, WithDecryption=True)

	return response['Parameter']['Value']


def create_response(body):
    response = {
        "statusCode": 200,
        "body": json.dumps(body, ensure_ascii=True)
    }

    return response


def get_icon_url(event, context):
    if not 'pathParameters' in event or not 'screen_name' in event['pathParameters']:
        print('[ERROR] screen_name is None.')
        return create_response({'success': False})
    screen_name = event['pathParameters']['screen_name']

    CONSUMER_KEY = get_secret('twitter-icon-classifier.twitter-consumer-key')
    CONSUMER_SECRET = get_secret('twitter-icon-classifier.twitter-consumer-secret')
    ACCESS_TOKEN_KEY = get_secret('twitter-icon-classifier.twitter-access-token-key')
    ACCESS_TOKEN_SECRET = get_secret('twitter-icon-classifier.twitter-access-token-secret')

    auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)
    api = tweepy.API(auth)

    try:
        user = api.get_user(screen_name=screen_name)
    except Exception:
        print('[ERROR] The user "{}" is not found.'.format(screen_name))
        return create_response({'success': False})
    url = user.profile_image_url_https.replace('_normal', '')
    
    return create_response({'success': True, 'url': url})
