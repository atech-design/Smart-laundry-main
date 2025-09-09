from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import time
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

jwt = JWTManager(app)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])  # Add your production domain

# In-memory storage (replace with database in production)
users = {}
carts = {}  # user_id: {items: [], total: 0}
orders = []
otp_storage = {}  # email: {otp: 123456, expires: timestamp}

# =============== HELPER FUNCTIONS ===============

def send_otp_email(email, otp):
    """Send OTP via email (configure with your SMTP settings)"""
    try:
        # Configure with your email provider
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "your-email@gmail.com"  # Change this
        sender_password = "your-app-password"   # Change this
        
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Smart Laundry - Your OTP Code"
        
        body = f"""
        <h2>Smart Laundry - Login OTP</h2>
        <p>Your OTP code is: <strong>{otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        """
        
        message.attach(MIMEText(body, "html"))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def generate_otp():
    return random.randint(100000, 999999)

def is_valid_email_or_phone(value):
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    phone_pattern = r'^\d{10}$'
    return re.match(email_pattern, value) or re.match(phone_pattern, value)

# =============== MOCK DATA ===============

SERVICES_DATA = [
    {
        "id": "wash-fold",
        "name": "Wash & Fold",
        "nameKey": "services.wash_fold.name",
        "category": "Laundry",
        "icon": "👔",
        "emoji": "👔",
        "description": "Regular clothes washing and folding",
        "descKey": "services.wash_fold.desc",
        "tagline": "Fresh & Clean Every Time",
        "taglineKey": "services.wash_fold.tagline",
        "before": "2 days",
        "after": "Same day",
        "steps": [
            {"key": "pickup", "text": "Free Pickup"},
            {"key": "wash", "text": "Professional Wash"},
            {"key": "dry", "text": "Gentle Drying"},
            {"key": "deliver", "text": "Doorstep Delivery"}
        ],
        "options": [
            {"id": "shirt", "label": "Shirt", "labelKey": "items.shirt", "price": 25, "emoji": "👔"},
            {"id": "tshirt", "label": "T-Shirt", "labelKey": "items.tshirt", "price": 20, "emoji": "👕"},
            {"id": "jeans", "label": "Jeans", "labelKey": "items.jeans", "price": 40, "emoji": "👖"},
            {"id": "dress", "label": "Dress", "labelKey": "items.dress", "price": 60, "emoji": "👗"}
        ],
        "perks": [
            {"key": "Free pickup & delivery", "text": "Free pickup & delivery"},
            {"key": "24-hour service", "text": "24-hour service"},
            {"key": "Eco-friendly detergents", "text": "Eco-friendly detergents"}
        ]
    },
    {
        "id": "dry-clean",
        "name": "Dry Cleaning",
        "nameKey": "services.dry_clean.name",
        "category": "Laundry",
        "icon": "🧥",
        "emoji": "🧥",
        "description": "Professional dry cleaning for delicate items",
        "descKey": "services.dry_clean.desc",
        "tagline": "Premium Care for Premium Clothes",
        "taglineKey": "services.dry_clean.tagline",
        "before": "5 days",
        "after": "2 days",
        "steps": [
            {"key": "inspect", "text": "Quality Inspection"},
            {"key": "clean", "text": "Dry Clean Process"},
            {"key": "press", "text": "Professional Pressing"},
            {"key": "package", "text": "Careful Packaging"}
        ],
        "options": [
            {"id": "suit", "label": "Suit", "labelKey": "items.suit", "price": 200, "emoji": "🤵"},
            {"id": "blazer", "label": "Blazer", "labelKey": "items.blazer", "price": 150, "emoji": "🧥"},
            {"id": "coat", "label": "Coat", "labelKey": "items.coat", "price": 180, "emoji": "🧥"},
            {"id": "saree", "label": "Saree", "labelKey": "items.saree", "price": 100, "emoji": "🥻"}
        ],
        "perks": [
            {"key": "Expert stain removal", "text": "Expert stain removal"},
            {"key": "Fabric protection", "text": "Fabric protection"},
            {"key": "Premium packaging", "text": "Premium packaging"}
        ]
    },
    {
        "id": "shoe-care",
        "name": "Shoe Care",
        "nameKey": "services.shoe_care.name",
        "category": "Accessories",
        "icon": "👞",
        "emoji": "👞",
        "description": "Complete shoe cleaning and care",
        "descKey": "services.shoe_care.desc",
        "tagline": "Step Out in Style",
        "taglineKey": "services.shoe_care.tagline",
        "before": "3 days",
        "after": "1 day",
        "steps": [
            {"key": "clean", "text": "Deep Cleaning"},
            {"key": "polish", "text": "Premium Polish"},
            {"key": "protect", "text": "Weather Protection"},
            {"key": "shine", "text": "Final Shine"}
        ],
        "options": [
            {"id": "leather-shoes", "label": "Leather Shoes", "labelKey": "items.leather_shoes", "price": 80, "emoji": "👞"},
            {"id": "sports-shoes", "label": "Sports Shoes", "labelKey": "items.sports_shoes", "price": 60, "emoji": "👟"},
            {"id": "boots", "label": "Boots", "labelKey": "items.boots", "price": 100, "emoji": "👢"},
            {"id": "sandals", "label": "Sandals", "labelKey": "items.sandals", "price": 40, "emoji": "👡"}
        ],
        "perks": [
            {"key": "Professional cleaning", "text": "Professional cleaning"},
            {"key": "Leather conditioning", "text": "Leather conditioning"},
            {"key": "Waterproof treatment", "text": "Waterproof treatment"}
        ]
    },
    {
        "id": "home-care",
        "name": "Home Care",
        "nameKey": "services.home_care.name",
        "category": "Home Care",
        "icon": "🏠",
        "emoji": "🏠",
        "description": "Curtains, carpets, and home textiles",
        "descKey": "services.home_care.desc",
        "tagline": "Clean Home, Happy Life",
        "taglineKey": "services.home_care.tagline",
        "before": "7 days",
        "after": "3 days",
        "steps": [
            {"key": "pickup", "text": "Home Pickup"},
            {"key": "clean", "text": "Specialized Cleaning"},
            {"key": "sanitize", "text": "Deep Sanitization"},
            {"key": "deliver", "text": "Safe Delivery"}
        ],
        "options": [
            {"id": "curtains", "label": "Curtains", "labelKey": "items.curtains", "price": 120, "emoji": "🪟"},
            {"id": "carpet", "label": "Carpet", "labelKey": "items.carpet", "price": 200, "emoji": "🧸"},
            {"id": "sofa-cover", "label": "Sofa Cover", "labelKey": "items.sofa_cover", "price": 150, "emoji": "🛋️"},
            {"id": "bedsheets", "label": "Bed Sheets", "labelKey": "items.bedsheets", "price": 80, "emoji": "🛏️"}
        ],
        "perks": [
            {"key": "Home pickup available", "text": "Home pickup available"},
            {"key": "Dust mite removal", "text": "Dust mite removal"},
            {"key": "Anti-bacterial treatment", "text": "Anti-bacterial treatment"}
        ]
    }
]

STATS_DATA = {
    "customers": 5000,
    "clothes": 50000,
    "years": 10
}

ABOUTUS_DATA = {
    "stats": [
        {"icon": "Users", "value": 5000, "suffix": "+", "label": "Happy Customers"},
        {"icon": "Shirt", "value": 50000, "suffix": "+", "label": "Clothes Cleaned"},
        {"icon": "Clock", "value": 10, "suffix": "+", "label": "Years Experience"}
    ],
    "values": [
        {"icon": "ShieldCheck", "title": "Quality First", "desc": "We ensure top-notch quality in every wash"},
        {"icon": "Truck", "title": "Fast Delivery", "desc": "Quick pickup and delivery at your doorstep"},
        {"icon": "Recycle", "title": "Eco-Friendly", "desc": "Using environmentally safe cleaning products"},
        {"icon": "HeartHandshake", "title": "Customer Care", "desc": "24/7 support for all your laundry needs"}
    ],
    "timeline": [
        {"year": "2014", "title": "Founded", "text": "Started as a small neighborhood laundry service"},
        {"year": "2018", "title": "Expansion", "text": "Expanded to serve multiple areas with advanced technology"},
        {"year": "2022", "title": "Digital", "text": "Launched mobile app and online booking system"},
        {"year": "2024", "title": "Premium", "text": "Introduced premium services and eco-friendly solutions"}
    ],
    "team": [
        {"name": "Raj Patel", "role": "Founder & CEO", "emoji": "👨‍💼"},
        {"name": "Priya Sharma", "role": "Operations Head", "emoji": "👩‍💻"},
        {"name": "Amit Kumar", "role": "Quality Manager", "emoji": "👨‍🔬"},
        {"name": "Sneha Singh", "role": "Customer Support", "emoji": "👩‍💬"}
    ],
    "testimonials": [
        {"name": "Rakesh Gupta", "text": "Best laundry service in the city! Always on time.", "rating": 5},
        {"name": "Anjali Mehta", "text": "My expensive sarees are handled with great care.", "rating": 5},
        {"name": "Suresh Yadav", "text": "Very professional and reliable service.", "rating": 4}
    ]
}

HOME_DATA = {
    "why_choose": [
        {"title": "Quick Service", "desc": "Same-day pickup and delivery", "border": "border-blue-500"},
        {"title": "Expert Care", "desc": "Professional handling of all fabrics", "border": "border-green-500"},
        {"title": "Affordable Rates", "desc": "Best prices in the neighborhood", "border": "border-yellow-500"}
    ],
    "how_it_works": [
        {"step": "Book Online", "desc": "Schedule pickup via app or website", "animKey": "booking"},
        {"step": "We Pickup", "desc": "Free pickup from your doorstep", "animKey": "pickup"},
        {"step": "We Clean", "desc": "Professional washing & care", "animKey": "washing"},
        {"step": "We Deliver", "desc": "Fresh clothes delivered back", "animKey": "delivery"}
    ],
    "final_cta": {
        "title": "Ready for Fresh & Clean Clothes?",
        "desc": "Book your first order now and get 20% off!",
        "ctaText": "Book Now - 20% Off!"
    }
}

# =============== AUTH ROUTES ===============

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email', '').strip()
    
    if not email or not is_valid_email_or_phone(email):
        return jsonify({'message': 'Invalid email or phone number'}), 400
    
    otp = generate_otp()
    expires = time.time() + 300  # 5 minutes
    
    otp_storage[email] = {'otp': otp, 'expires': expires}
    
    # For development, print OTP to console
    print(f"OTP for {email}: {otp}")
    
    # In production, uncomment this to send real emails
    # if not send_otp_email(email, otp):
    #     return jsonify({'message': 'Failed to send OTP'}), 500
    
    return jsonify({'message': 'OTP sent successfully'}), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    otp = data.get('otp', '')
    
    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400
    
    # Verify OTP
    if email not in otp_storage:
        return jsonify({'message': 'OTP not found or expired'}), 400
    
    stored_data = otp_storage[email]
    if time.time() > stored_data['expires']:
        del otp_storage[email]
        return jsonify({'message': 'OTP expired'}), 400
    
    if str(stored_data['otp']) != str(otp):
        return jsonify({'message': 'Invalid OTP'}), 400
    
    # OTP verified, create/login user
    if email not in users:
        users[email] = {
            'id': email,
            'email': email,
            'name': email.split('@')[0] if '@' in email else email,
            'phone': email if email.isdigit() else '',
            'role': 'admin' if email in ['admin@laundry.com', 'admin'] else 'user',
            'created_at': datetime.now().isoformat()
        }
    
    user = users[email]
    token = create_access_token(identity=email)
    
    # Clear OTP
    del otp_storage[email]
    
    return jsonify({
        'token': token,
        'user': user,
        'message': 'Login successful'
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    if user_id not in users:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(users[user_id]), 200

@app.route('/api/auth/google', methods=['GET'])
def google_auth():
    # Mock Google auth for development
    # In production, implement proper Google OAuth
    return jsonify({'message': 'Google auth not implemented yet'}), 501

# =============== SERVICES ROUTES ===============

@app.route('/api/services/', methods=['GET'])
def get_services():
    return jsonify(SERVICES_DATA), 200

@app.route('/api/services/<service_id>', methods=['GET'])
def get_service_detail(service_id):
    service = next((s for s in SERVICES_DATA if s['id'] == service_id), None)
    if not service:
        return jsonify({'message': 'Service not found'}), 404
    
    return jsonify(service), 200

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = list(set(s['category'] for s in SERVICES_DATA))
    return jsonify(['All'] + categories), 200

@app.route('/api/languages', methods=['GET'])
def get_languages():
    return jsonify(['en', 'hi', 'mr']), 200

# =============== CART ROUTES ===============

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart = carts.get(user_id, {'items': [], 'total': 0, 'totalQty': 0})
    return jsonify(cart), 200

@app.route('/api/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('id')
    qty = data.get('qty', 1)
    
    if user_id not in carts:
        carts[user_id] = {'items': [], 'total': 0, 'totalQty': 0}
    
    cart = carts[user_id]
    
    # Find item in all services
    item_data = None
    for service in SERVICES_DATA:
        for option in service['options']:
            if option['id'] == item_id:
                item_data = option
                break
        if item_data:
            break
    
    if not item_data:
        return jsonify({'message': 'Item not found'}), 404
    
    # Check if item already exists in cart
    existing_item = next((item for item in cart['items'] if item['id'] == item_id), None)
    
    if existing_item:
        existing_item['qty'] += qty
    else:
        cart['items'].append({
            'id': item_id,
            'name': item_data['label'],
            'price': item_data['price'],
            'emoji': item_data['emoji'],
            'qty': qty
        })
    
    # Recalculate totals
    cart['total'] = sum(item['price'] * item['qty'] for item in cart['items'])
    cart['totalQty'] = sum(item['qty'] for item in cart['items'])
    
    return jsonify({'message': 'Item added to cart', 'cart': cart}), 200

@app.route('/api/cart/decrease', methods=['POST'])
@jwt_required()
def decrease_cart_qty():
    user_id = get_jwt_identity()
    data = request.get_json()
    item_id = data.get('id')
    
    if user_id not in carts:
        return jsonify({'message': 'Cart not found'}), 404
    
    cart = carts[user_id]
    item = next((item for item in cart['items'] if item['id'] == item_id), None)
    
    if not item:
        return jsonify({'message': 'Item not found in cart'}), 404
    
    item['qty'] -= 1
    if item['qty'] <= 0:
        cart['items'] = [i for i in cart['items'] if i['id'] != item_id]
    
    # Recalculate totals
    cart['total'] = sum(item['price'] * item['qty'] for item in cart['items'])
    cart['totalQty'] = sum(item['qty'] for item in cart['items'])
    
    return jsonify({'message': 'Item quantity decreased', 'cart': cart}), 200

@app.route('/api/cart/<item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    
    if user_id not in carts:
        return jsonify({'message': 'Cart not found'}), 404
    
    cart = carts[user_id]
    cart['items'] = [item for item in cart['items'] if item['id'] != item_id]
    
    # Recalculate totals
    cart['total'] = sum(item['price'] * item['qty'] for item in cart['items'])
    cart['totalQty'] = sum(item['qty'] for item in cart['items'])
    
    return jsonify({'message': 'Item removed from cart', 'cart': cart}), 200

@app.route('/api/cart', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    carts[user_id] = {'items': [], 'total': 0, 'totalQty': 0}
    return jsonify({'message': 'Cart cleared'}), 200

# =============== CHECKOUT ROUTES ===============

@app.route('/api/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()
    cart_items = data.get('cart', [])
    total = data.get('total', 0)
    
    if not cart_items:
        return jsonify({'message': 'Cart is empty'}), 400
    
    # Create order
    order = {
        'id': f"ORD_{int(time.time())}",
        'user_id': user_id,
        'items': cart_items,
        'total': total,
        'status': 'Pending',
        'created_at': datetime.now().isoformat(),
        'pickup_time': (datetime.now() + timedelta(hours=2)).strftime('%Y-%m-%d %H:%M'),
        'delivery_time': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d %H:%M')
    }
    
    orders.append(order)
    
    # Clear user cart
    carts[user_id] = {'items': [], 'total': 0, 'totalQty': 0}
    
    return jsonify({'success': True, 'order_id': order['id'], 'message': 'Order placed successfully'}), 200

# =============== ORDERS ROUTES ===============

@app.route('/api/orders/my', methods=['GET'])
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    user_orders = [order for order in orders if order['user_id'] == user_id]
    
    # Convert to expected format
    formatted_orders = []
    for order in user_orders:
        formatted_orders.append({
            '_id': order['id'],
            'serviceName': 'Laundry Service',
            'status': order['status'],
            'total': order['total'],
            'createdAt': order['created_at'],
            'pickupTime': order['pickup_time'],
            'deliveryTime': order['delivery_time']
        })
    
    return jsonify(formatted_orders), 200

# =============== HOME PAGE DATA ===============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(STATS_DATA), 200

@app.route('/api/why-choose', methods=['GET'])
def get_why_choose():
    return jsonify(HOME_DATA['why_choose']), 200

@app.route('/api/how-it-works', methods=['GET'])
def get_how_it_works():
    return jsonify(HOME_DATA['how_it_works']), 200

@app.route('/api/final-cta', methods=['GET'])
def get_final_cta():
    return jsonify(HOME_DATA['final_cta']), 200

# =============== ABOUT US ROUTES ===============

@app.route('/api/aboutus', methods=['GET'])
def get_aboutus():
    return jsonify(ABOUTUS_DATA), 200

# =============== CONTACT ROUTES ===============

@app.route('/api/contact', methods=['POST'])
def contact_form():
    data = request.get_json()
    name = data.get('name', '')
    email = data.get('email', '')
    message = data.get('message', '')
    
    if not name or not email or not message:
        return jsonify({'message': 'All fields are required'}), 400
    
    # In production, save to database or send email
    print(f"Contact form submission:")
    print(f"Name: {name}")
    print(f"Email: {email}")
    print(f"Message: {message}")
    
    return jsonify({'message': 'Message sent successfully'}), 200

# =============== ADMIN ROUTES (Basic) ===============

@app.route('/api/admin/orders', methods=['GET'])
@jwt_required()
def admin_get_orders():
    user_id = get_jwt_identity()
    if user_id not in users or users[user_id]['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    return jsonify(orders), 200

@app.route('/api/admin/orders/<order_id>/status', methods=['PUT'])
@jwt_required()
def admin_update_order_status(order_id):
    user_id = get_jwt_identity()
    if user_id not in users or users[user_id]['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    new_status = data.get('status')
    
    order = next((o for o in orders if o['id'] == order_id), None)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    order['status'] = new_status
    return jsonify({'message': 'Order status updated', 'order': order}), 200

# =============== HEALTH CHECK ===============

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Smart Laundry Backend API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/*',
            'services': '/api/services/*',
            'cart': '/api/cart/*',
            'orders': '/api/orders/*',
            'contact': '/api/contact',
            'health': '/health'
        }
    }), 200

# =============== ERROR HANDLERS ===============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'message': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'message': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'message': 'Token is required'}), 401

# =============== PRODUCTION CONFIG ===============

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

# For production, use gunicorn:
# gunicorn -w 4 -b 0.0.0.0:5000 app:app