"""
VoltixIO Marketing Analytics Web Dashboard
==========================================

Flask web application for marketing analytics dashboard
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from voltixio_marketing_engine import VoltixIOMarketingEngine
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize marketing engine
engine = VoltixIOMarketingEngine()

# Routes

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        "status": "VoltixIO Marketing API Running",
        "version": "1.0",
        "endpoints": [
            "/marketing/analytics",
            "/api/analytics",
            "/api/campaigns",
            "/api/metrics/<platform>",
            "/api/health"
        ]
    })

@app.route('/marketing/analytics')
def analytics_dashboard():
    """Main analytics dashboard page"""
    return render_template('analytics.html',
                          title="VoltixIO Marketing Analytics",
                          analytics=engine.analytics)

@app.route('/api/analytics')
def get_analytics():
    """Get all analytics data"""
    return jsonify({
        "status": "success",
        "data": engine.analytics,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Get all campaigns"""
    return jsonify({
        "status": "success",
        "data": {
            "total": len(engine.content_calendar),
            "campaigns": [
                {
                    "id": c.get("id"),
                    "type": c.get("type"),
                    "topic": c.get("topic"),
                    "status": c.get("status"),
                    "created_at": c.get("generated_at"),
                    "platforms": list(c.get("platforms", {}).keys())
                }
                for c in engine.content_calendar
            ]
        }
    })

@app.route('/api/campaigns/<campaign_id>')
def get_campaign(campaign_id):
    """Get specific campaign details"""
    for campaign in engine.content_calendar:
        if campaign.get("id") == campaign_id:
            return jsonify({
                "status": "success",
                "data": campaign
            })
    return jsonify({"status": "error", "message": "Campaign not found"}), 404

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    """Create new campaign

    Request body:
    {
        "topic": "GPU optimization",
        "content_type": "engagement|educational|promotional|testimonial",
        "create_video": true|false
    }
    """
    try:
        data = request.json

        if not data.get('topic'):
            return jsonify({"status": "error", "message": "topic is required"}), 400

        # Run campaign
        campaign = engine.end_to_end_campaign(
            topic=data.get('topic'),
            content_type=data.get('content_type', 'engagement'),
            create_video=data.get('create_video', True)
        )

        return jsonify({
            "status": "success",
            "data": {
                "campaign_id": campaign.get("id"),
                "topic": campaign.get("topic"),
                "type": campaign.get("type"),
                "status": "created",
                "platforms": list(campaign.get("platforms", {}).keys())
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/metrics')
def get_all_metrics():
    """Get aggregated metrics across all platforms"""
    if not engine.analytics:
        return jsonify({
            "status": "error",
            "message": "No analytics data available yet"
        }), 404

    return jsonify({
        "status": "success",
        "data": {
            "total_reach": engine.analytics.get("total_reach", 0),
            "total_engagement": engine.analytics.get("total_engagement", 0),
            "engagement_rate": engine.analytics.get("engagement_rate", 0),
            "audience_growth": engine.analytics.get("audience_growth", {}),
            "platforms": engine.analytics.get("platforms", {})
        }
    })

@app.route('/api/metrics/<platform>')
def get_platform_metrics(platform):
    """Get metrics for specific platform

    Available platforms: twitter, linkedin, instagram, tiktok, slack
    """
    if not engine.analytics or "platforms" not in engine.analytics:
        return jsonify({
            "status": "error",
            "message": "No analytics data available"
        }), 404

    if platform not in engine.analytics["platforms"]:
        return jsonify({
            "status": "error",
            "message": f"Platform '{platform}' not found",
            "available": list(engine.analytics["platforms"].keys())
        }), 404

    return jsonify({
        "status": "success",
        "platform": platform,
        "data": engine.analytics["platforms"][platform]
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "VoltixIO Marketing API",
        "version": "1.0",
        "stats": {
            "campaigns_created": len(engine.content_calendar),
            "posts_published": len(engine.published_content),
            "analytics_available": bool(engine.analytics),
            "platforms": len(engine.platforms) if hasattr(engine, 'platforms') else 5
        }
    })

@app.route('/api/status')
def status():
    """Detailed status endpoint"""
    return jsonify({
        "service": "VoltixIO Marketing Analytics",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "uptime": "healthy",
        "components": {
            "api": "operational",
            "analytics": "operational",
            "social_media": "connected",
            "ai_engine": "operational"
        },
        "endpoints": {
            "dashboard": "/marketing/analytics",
            "analytics_api": "/api/analytics",
            "campaigns": "/api/campaigns",
            "metrics": "/api/metrics",
            "health": "/api/health"
        }
    })

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "status": "error",
        "message": "Endpoint not found",
        "path": request.path
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "status": "error",
        "message": "Internal server error"
    }), 500

# Main

if __name__ == '__main__':
    # Get configuration from environment
    debug = os.getenv('FLASK_ENV') == 'development'
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))

    # Start server
    print(f"""
    ╔════════════════════════════════════════════╗
    ║  VoltixIO Marketing Analytics Dashboard    ║
    ╚════════════════════════════════════════════╝

    Server: http://{host}:{port}
    Dashboard: http://{host}:{port}/marketing/analytics
    API: http://{host}:{port}/api

    Debug: {debug}

    Press CTRL+C to stop.
    """)

    app.run(host=host, port=port, debug=debug)
