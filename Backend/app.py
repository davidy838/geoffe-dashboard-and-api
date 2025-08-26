from flask import Flask
from api import bp
import os

def create_app():
    app = Flask(__name__)
    
    # Register the blueprint
    app.register_blueprint(bp, url_prefix='/api')
    
    # Add a simple health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'message': 'Service is running'}, 200
    
    # Enable CORS for all routes
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False) 