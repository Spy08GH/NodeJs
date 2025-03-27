from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Tweet, User

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/api/tweets', methods=['GET'])
def get_tweets():
    tweets = Tweet.query.order_by(Tweet.created_at.desc()).all()
    return jsonify([tweet.to_dict() for tweet in tweets]), 200

@routes_bp.route('/api/tweets/following', methods=['GET'])
@jwt_required()
def get_following_tweets():
    # In a real app, this would filter tweets from followed users
    # For now, return all tweets
    tweets = Tweet.query.order_by(Tweet.created_at.desc()).all()
    return jsonify([tweet.to_dict() for tweet in tweets]), 200

@routes_bp.route('/api/tweets', methods=['POST'])
@jwt_required()
def create_tweet():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({"error": "Tweet content is required"}), 400
    
    if len(data['content']) > 280:
        return jsonify({"error": "Tweet content too long"}), 400
    
    tweet = Tweet(content=data['content'], user_id=user_id)
    db.session.add(tweet)
    db.session.commit()
    
    return jsonify(tweet.to_dict()), 201