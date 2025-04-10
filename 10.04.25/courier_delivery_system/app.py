# app.py - Flask приложение для работы с базой данных
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from sqlalchemy import create_engine, func, desc
from sqlalchemy.orm import sessionmaker, scoped_session
from main import Base, Role, User, Order, Invoice, Tracker
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Подключение к базе данных
engine = create_engine('sqlite:///courier_delivery.db')
Base.metadata.bind = engine

# Создание сессии
db_session = scoped_session(sessionmaker(bind=engine))

# Добавляем фильтр для преобразования временной метки в читаемую дату
@app.template_filter('timestamp_to_date')
def timestamp_to_date(timestamp):
    return datetime.fromtimestamp(timestamp).strftime('%d.%m.%Y %H:%M')

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/')
def index():
    # Статистика для дашборда
    total_users = db_session.query(func.count(User.id)).scalar()
    total_orders = db_session.query(func.count(Order.id)).scalar()
    total_couriers = db_session.query(func.count(User.id)).filter(User.role_id == 4).scalar()
    total_revenue = db_session.query(func.sum(Invoice.price)).scalar() or 0
    
    # Последние 5 заказов
    recent_orders = db_session.query(Order).order_by(desc(Order.created_at)).limit(5).all()
    
    # Топ курьеров
    top_couriers = db_session.query(
        User.id, User.name, User.lastname, func.count(Tracker.id).label('order_count')
    ).join(Tracker, User.id == Tracker.courier_id)\
    .group_by(User.id)\
    .order_by(desc('order_count'))\
    .limit(5).all()
    
    return render_template('index.html', 
                           total_users=total_users,
                           total_orders=total_orders,
                           total_couriers=total_couriers,
                           total_revenue=total_revenue,
                           recent_orders=recent_orders,
                           top_couriers=top_couriers)

@app.route('/users')
def users():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page
    
    users = db_session.query(User).join(Role).add_columns(
        User.id, User.name, User.lastname, User.surname, User.username, Role.name.label('role_name')
    ).offset(offset).limit(per_page).all()
    
    total = db_session.query(func.count(User.id)).scalar()
    
    return render_template('users.html', 
                           users=users, 
                           page=page, 
                           per_page=per_page, 
                           total=total)

@app.route('/orders')
def orders():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page
    
    orders = db_session.query(Order).join(User, Order.user_id == User.id)\
        .join(Invoice, Order.invoice_id == Invoice.id)\
        .add_columns(
            Order.id, 
            Order.address_from_lat, 
            Order.address_from_long,
            Order.address_to_lat,
            Order.address_to_long,
            Order.created_at,
            User.name.label('customer_name'),
            User.lastname.label('customer_lastname'),
            Invoice.price
        ).offset(offset).limit(per_page).all()
    
    total = db_session.query(func.count(Order.id)).scalar()
    
    return render_template('orders.html', 
                           orders=orders, 
                           page=page, 
                           per_page=per_page, 
                           total=total)

@app.route('/trackers')
def trackers():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page
    
    trackers = db_session.query(Tracker).join(User, Tracker.courier_id == User.id)\
        .join(Order, Tracker.order_id == Order.id)\
        .add_columns(
            Tracker.id,
            Tracker.track_number,
            User.name.label('courier_name'),
            User.lastname.label('courier_lastname'),
            Order.id.label('order_id')
        ).offset(offset).limit(per_page).all()
    
    total = db_session.query(func.count(Tracker.id)).scalar()
    
    return render_template('trackers.html', 
                           trackers=trackers, 
                           page=page, 
                           per_page=per_page, 
                           total=total)

@app.route('/invoices')
def invoices():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page
    
    invoices = db_session.query(Invoice).join(Order, Invoice.id == Order.invoice_id)\
        .add_columns(
            Invoice.id,
            Invoice.price,
            Invoice.courier_price,
            Invoice.commission,
            Order.id.label('order_id')
        ).offset(offset).limit(per_page).all()
    
    total = db_session.query(func.count(Invoice.id)).scalar()
    
    return render_template('invoices.html', 
                           invoices=invoices, 
                           page=page, 
                           per_page=per_page, 
                           total=total)

@app.route('/order/<int:order_id>')
def order_detail(order_id):
    order = db_session.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        flash('Заказ не найден', 'error')
        return redirect(url_for('orders'))
    
    # Получаем информацию о пользователе (заказчике)
    customer = db_session.query(User).filter(User.id == order.user_id).first()
    
    # Получаем информацию о счете
    invoice = db_session.query(Invoice).filter(Invoice.id == order.invoice_id).first()
    
    # Получаем трекер
    tracker = db_session.query(Tracker).filter(Tracker.order_id == order.id).first()
    
    # Получаем информацию о курьере
    courier = None
    if tracker:
        courier = db_session.query(User).filter(User.id == tracker.courier_id).first()
    
    return render_template('order_detail.html', 
                           order=order, 
                           customer=customer, 
                           invoice=invoice, 
                           tracker=tracker, 
                           courier=courier)

@app.route('/api/order_stats', methods=['GET'])
def order_stats():
    # Статистика заказов по месяцам для графика
    result = db_session.execute("""
        SELECT 
            strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
            COUNT(id) as order_count
        FROM orders
        GROUP BY month
        ORDER BY month ASC
    """).fetchall()
    
    months = [row[0] for row in result]
    counts = [row[1] for row in result]
    
    return jsonify({
        'labels': months,
        'data': counts
    })

if __name__ == '__main__':
    app.run(debug=True)