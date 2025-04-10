# main.py - основной файл проекта
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, CheckConstraint, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import random
import hashlib
import string
import faker
import argparse

# Создаем базовый класс для моделей
Base = declarative_base()

# Определяем модели данных
class Role(Base):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    
    users = relationship('User', back_populates='role')
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"


class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    lastname = Column(String(100), nullable=True)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=True)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(128), nullable=False)  # хранится хеш пароля
    
    # Связи
    role = relationship('Role', back_populates='users')
    orders = relationship('Order', back_populates='user')
    trackers_as_courier = relationship('Tracker', back_populates='courier')
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role_id={self.role_id})>"
    
    @staticmethod
    def hash_password(password):
        # Простой хеш пароля с использованием SHA-256
        return hashlib.sha256(password.encode()).hexdigest()


class Invoice(Base):
    __tablename__ = 'invoices'
    
    id = Column(Integer, primary_key=True)
    price = Column(Float, CheckConstraint('price >= 0'), nullable=False)
    courier_price = Column(Float, CheckConstraint('courier_price >= 0'), nullable=False)
    commission = Column(Float, CheckConstraint('commission >= 0'), nullable=False)
    
    # Обратная связь с Order
    order = relationship('Order', back_populates='invoice', uselist=False)
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, price={self.price}, courier_price={self.courier_price}, commission={self.commission})>"


class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    address_from_lat = Column(Float, nullable=False)
    address_from_long = Column(Float, nullable=False)
    address_to_lat = Column(Float, nullable=False)
    address_to_long = Column(Float, nullable=False)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=True)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.now().timestamp()))
    
    # Связи
    user = relationship('User', back_populates='orders')
    invoice = relationship('Invoice', back_populates='order')
    trackers = relationship('Tracker', back_populates='order')
    
    def __repr__(self):
        return f"<Order(id={self.id}, user_id={self.user_id}, from=({self.address_from_lat},{self.address_from_long}), to=({self.address_to_lat},{self.address_to_long}))>"


class Tracker(Base):
    __tablename__ = 'trackers'
    
    id = Column(Integer, primary_key=True)
    courier_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    track_number = Column(String(50), nullable=False, unique=True)
    
    # Связи
    courier = relationship('User', back_populates='trackers_as_courier')
    order = relationship('Order', back_populates='trackers')
    
    def __repr__(self):
        return f"<Tracker(id={self.id}, courier_id={self.courier_id}, order_id={self.order_id}, track_number='{self.track_number}')>"


def create_database(db_url='sqlite:///courier_delivery.db'):
    # Создание движка БД
    engine = create_engine(db_url, echo=False)
    
    # Создание таблиц
    Base.metadata.create_all(engine)
    
    return engine


def seed_database(engine, num_users=10, num_orders=2000):
    # Создание сессии
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Создание фейкера для генерации данных
    fake = faker.Faker()
    
    # Создание ролей
    roles = [
        Role(name='Admin'),
        Role(name='Manager'),
        Role(name='Customer'),
        Role(name='Courier')
    ]
    session.add_all(roles)
    session.commit()
    
    # Создание пользователей
    users = []
    
    # Админ
    admin = User(
        lastname=fake.last_name(),
        name=fake.first_name(),
        surname=fake.last_name(),
        role_id=1,  # Admin
        username='admin',
        password=User.hash_password('admin123')
    )
    users.append(admin)
    
    # Добавим курьеров (минимум 3)
    for i in range(3):
        courier = User(
            lastname=fake.last_name(),
            name=fake.first_name(),
            surname=fake.last_name(),
            role_id=4,  # Courier
            username=f'courier{i+1}',
            password=User.hash_password(f'courier{i+1}')
        )
        users.append(courier)
    
    # Остальные пользователи (клиенты)
    for i in range(num_users - 4):  # -4 потому что уже добавили админа и 3 курьера
        user = User(
            lastname=fake.last_name() if random.random() > 0.1 else None,
            name=fake.first_name(),
            surname=fake.last_name() if random.random() > 0.1 else None,
            role_id=3,  # Customer
            username=fake.user_name() + str(i),
            password=User.hash_password(fake.password(length=10))
        )
        users.append(user)
    
    session.add_all(users)
    session.commit()
    
    # Получаем всех курьеров
    couriers = session.query(User).filter(User.role_id == 4).all()
    
    # Получаем всех клиентов
    customers = session.query(User).filter(User.role_id == 3).all()
    
    # Создание заказов и связанных с ними инвойсов и трекеров
    for i in range(num_orders):
        # Создаем инвойс
        price = round(random.uniform(100, 5000), 2)
        courier_price = round(price * 0.7, 2)  # 70% от цены для курьера
        commission = round(price * 0.3, 2)  # 30% комиссия сервиса
        
        invoice = Invoice(
            price=price,
            courier_price=courier_price,
            commission=commission
        )
        session.add(invoice)
        session.flush()  # чтобы получить ID
        
        # Создаем заказ
        customer = random.choice(customers)
        
        # Генерация координат (примерно в пределах крупного города)
        center_lat, center_long = 55.7558, 37.6176  # координаты Москвы
        
        order = Order(
            user_id=customer.id,
            address_from_lat=center_lat + random.uniform(-0.1, 0.1),
            address_from_long=center_long + random.uniform(-0.1, 0.1),
            address_to_lat=center_lat + random.uniform(-0.1, 0.1),
            address_to_long=center_long + random.uniform(-0.1, 0.1),
            invoice_id=invoice.id,
            created_at=int((datetime.now() - timedelta(days=random.randint(0, 180))).timestamp())
        )
        session.add(order)
        session.flush()  # чтобы получить ID
        
        # Создаем трекер для заказа
        courier = random.choice(couriers)
        
        # Генерация уникального номера трекера
        track_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        
        tracker = Tracker(
            courier_id=courier.id,
            order_id=order.id,
            track_number=track_number
        )
        session.add(tracker)
        
        # Коммитим каждые 100 записей для экономии памяти
        if (i + 1) % 100 == 0:
            session.commit()
            print(f"Processed {i+1}/{num_orders} orders")
    
    # Финальный коммит
    session.commit()
    print(f"Database seeded with {num_users} users and {num_orders} orders!")
    
    session.close()


def run_queries(engine):
    """Выполнение некоторых тестовых запросов для проверки производительности."""
    Session = sessionmaker(bind=engine)
    session = Session()
    
    print("\nRunning test queries...")
    
    # 1. Количество заказов по каждому курьеру
    start_time = datetime.now()
    result = session.execute("""
        SELECT u.id, u.name, u.lastname, COUNT(t.id) as order_count
        FROM users u
        JOIN trackers t ON u.id = t.courier_id
        GROUP BY u.id, u.name, u.lastname
        ORDER BY order_count DESC
    """).fetchall()
    
    print(f"\n1. Orders per courier (execution time: {(datetime.now() - start_time).total_seconds():.4f}s):")
    for row in result:
        print(f"Courier ID: {row[0]}, Name: {row[1]} {row[2] or ''}, Orders: {row[3]}")
    
    # 2. Средняя стоимость заказа
    start_time = datetime.now()
    result = session.execute("""
        SELECT AVG(price) as avg_price
        FROM invoices
    """).fetchone()
    
    print(f"\n2. Average order price (execution time: {(datetime.now() - start_time).total_seconds():.4f}s):")
    print(f"Average price: ${result[0]:.2f}")
    
    # 3. Топ-5 клиентов по количеству заказов
    start_time = datetime.now()
    result = session.execute("""
        SELECT u.id, u.username, COUNT(o.id) as order_count
        FROM users u
        JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.username
        ORDER BY order_count DESC
        LIMIT 5
    """).fetchall()
    
    print(f"\n3. Top 5 customers by order count (execution time: {(datetime.now() - start_time).total_seconds():.4f}s):")
    for row in result:
        print(f"User ID: {row[0]}, Username: {row[1]}, Orders: {row[2]}")
    
    # 4. Статистика заказов по месяцам
    start_time = datetime.now()
    result = session.execute("""
        SELECT 
            strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
            COUNT(id) as order_count,
            AVG(
                (SELECT price FROM invoices WHERE id = orders.invoice_id)
            ) as avg_price
        FROM orders
        GROUP BY month
        ORDER BY month DESC
    """).fetchall()
    
    print(f"\n4. Monthly order statistics (execution time: {(datetime.now() - start_time).total_seconds():.4f}s):")
    for row in result:
        print(f"Month: {row[0]}, Orders: {row[1]}, Avg Price: ${row[2]:.2f}")
    
    session.close()


def main():
    parser = argparse.ArgumentParser(description='Generate a courier delivery database and run test queries')
    parser.add_argument('--users', type=int, default=10, help='Number of users to generate')
    parser.add_argument('--orders', type=int, default=2000, help='Number of orders to generate')
    parser.add_argument('--queries', action='store_true', help='Run test queries after generation')
    
    args = parser.parse_args()
    
    print("Creating database...")
    engine = create_database()
    
    print(f"Seeding database with {args.users} users and {args.orders} orders...")
    seed_database(engine, num_users=args.users, num_orders=args.orders)
    
    if args.queries:
        run_queries(engine)
    
    print("Done!")


if __name__ == "__main__":
    main()