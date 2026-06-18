import os
from dotenv import load_dotenv
load_dotenv()
from app import create_app, db, bcrypt
from app.models.user import User, Role
from app.models.vehicle import Vehicle, VehicleImage, VehicleCategory
from app.models.branch import Branch
from app.models.coupon import Coupon
from datetime import datetime, timedelta

app = create_app()

def seed():
    with app.app_context():
        db.create_all()

        # ── Roles ─────────────────────────────────────────────────────────────
        roles = [
            ('super_admin',    'Super Administrator'),
            ('branch_manager', 'Branch Manager'),
            ('staff',          'Staff Member'),
            ('customer',       'Customer'),
        ]
        role_map = {}
        for name, desc in roles:
            r = Role.query.filter_by(name=name).first()
            if not r:
                r = Role(name=name, description=desc)
                db.session.add(r)
                db.session.flush()
            role_map[name] = r.id

        # ── Branches ──────────────────────────────────────────────────────────
        branches_data = [
            ('DriveEase Nairobi CBD', 'NBI001', 'Kimathi Street',        'Nairobi',  'Kenya', '+254700000001', 'nairobi@drivease.com',  -1.2864,  36.8172),
            ('DriveEase Mombasa',     'MBA001', 'Moi Avenue',            'Mombasa',  'Kenya', '+254700000002', 'mombasa@drivease.com',  -4.0435,  39.6682),
            ('DriveEase Kisumu',      'KSM001', 'Oginga Odinga Street',  'Kisumu',   'Kenya', '+254700000003', 'kisumu@drivease.com',   -0.1022,  34.7617),
        ]
        branch_ids = []
        for name, code, addr, city, country, phone, email, lat, lng in branches_data:
            b = Branch.query.filter_by(code=code).first()
            if not b:
                b = Branch(
                    name=name, code=code, address=addr, city=city,
                    country=country, phone=phone, email=email,
                    latitude=lat, longitude=lng,
                    opening_hours={
                        'monday':    '08:00-18:00',
                        'tuesday':   '08:00-18:00',
                        'saturday':  '09:00-14:00',
                    }
                )
                db.session.add(b)
                db.session.flush()
            branch_ids.append(b.id)

        # ── Staff & customers ─────────────────────────────────────────────────
        staff = [
            ('Admin',  'User',    'admin@drivease.com',   'Admin@2025!',    'super_admin'),
            ('Jane',   'Manager', 'manager@drivease.com', 'Manager@2025!',  'branch_manager'),
            ('Staff',  'Member',  'staff@drivease.com',   'Staff@2025!',    'staff'),
            ('John',   'Doe',     'john@example.com',     'Customer@2025!', 'customer'),
        ]
        for first, last, email, pw, role in staff:
            if not User.query.filter_by(email=email).first():
                u = User(
                    first_name = first,
                    last_name  = last,
                    email      = email,
                    password   = bcrypt.generate_password_hash(pw).decode(),
                    role_id    = role_map[role],
                    is_active  = True,
                    is_verified= True,
                    branch_id  = branch_ids[0] if role != 'customer' else None,
                )
                db.session.add(u)
        db.session.flush()

        # ── Vehicle categories ────────────────────────────────────────────────
        cats = [
            ('Luxury',      'luxury',      '⭐'),
            ('SUV',         'suv',         '🚙'),
            ('Sedan',       'sedan',       '🚗'),
            ('Electric',    'electric',    '⚡'),
            ('Economy',     'economy',     '💰'),
            ('Van',         'van',         '🚌'),
            ('Sports',      'sports',      '🏎️'),
            ('Convertible', 'convertible', '🌤️'),
        ]
        cat_map = {}
        for name, slug, icon in cats:
            c = VehicleCategory.query.filter_by(slug=slug).first()
            if not c:
                c = VehicleCategory(name=name, slug=slug, icon=icon)
                db.session.add(c)
                db.session.flush()
            cat_map[slug] = c.id

        # ── Vehicles ──────────────────────────────────────────────────────────
        # Columns: name, brand, model, year, cat_slug, plate, color, fuel,
        #          trans, seats, doors, engine, mileage, daily_rate, deposit,
        #          description, features, is_featured, image_url
        vehicles = [
            (
                'Mercedes-Benz S-Class', 'Mercedes-Benz', 'S-Class', 2024,
                'luxury', 'KCA 001A', 'Silver', 'petrol', 'automatic', 5, 4,
                '3.0L', 280, 12000, 1500,
                'The pinnacle of luxury motoring with cutting-edge technology and supreme comfort.',
                ['GPS', 'Leather Seats', 'Sunroof', 'Heated Seats', 'Ambient Lighting', '4G WiFi'],
                True,
                'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
            ),
            (
                'BMW X5', 'BMW', 'X5', 2024,
                'suv', 'KCB 002B', 'White', 'petrol', 'automatic', 7, 4,
                '3.0L', 150, 9500, 1000,
                'Powerful SUV combining luxury, performance and practicality for any adventure.',
                ['GPS', 'Panoramic Roof', 'Heated Seats', '4WD', 'Apple CarPlay', 'Parking Sensors'],
                True,
                'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
            ),
            (
                'Toyota Camry', 'Toyota', 'Camry', 2023,
                'sedan', 'KCC 003C', 'Pearl', 'petrol', 'automatic', 5, 4,
                '2.5L', 45000, 4500, 400,
                'Reliable, comfortable sedan perfect for business travel and family trips.',
                ['GPS', 'Bluetooth', 'Reverse Camera', 'Cruise Control'],
                False,
                'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
            ),
            (
                'Tesla Model 3', 'Tesla', 'Model 3', 2024,
                'electric', 'KCD 004D', 'Red', 'electric', 'automatic', 5, 4,
                'Electric', 12000, 8500, 800,
                'Zero-emission luxury with cutting-edge autopilot and over 500km range.',
                ['Autopilot', 'GPS', 'Supercharger Network', 'OTA Updates', 'Glass Roof'],
                True,
                'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
            ),
            (
                'Toyota Corolla', 'Toyota', 'Corolla', 2023,
                'economy', 'KCE 005E', 'Blue', 'petrol', 'automatic', 5, 4,
                '1.8L', 62000, 2500, 200,
                'Fuel-efficient and reliable economy car, perfect for city driving.',
                ['Bluetooth', 'AC', 'Reverse Camera'],
                False,
                'https://images.unsplash.com/photo-1574950578143-858c6fc58922?w=800',
            ),
            (
                'Range Rover Sport', 'Land Rover', 'Range Rover Sport', 2024,
                'suv', 'KCF 006F', 'Black', 'diesel', 'automatic', 5, 4,
                '3.0L', 8000, 15000, 1500,
                'Ultimate luxury SUV for the discerning driver who demands the best.',
                ['Air Suspension', 'Terrain Response', 'Meridian Audio', '4WD', 'GPS'],
                True,
                'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800',
            ),
            (
                'Porsche 911', 'Porsche', '911 Carrera', 2024,
                'sports', 'KCG 007G', 'Yellow', 'petrol', 'automatic', 4, 2,
                '3.0L', 6000, 18000, 2000,          # ← deposit_amount was missing before
                'The iconic sports car. Pure performance meets everyday usability.',
                ['Sport Chrono', 'PASM', 'Bose Sound', 'Sport Exhaust'],
                True,
                'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800',
            ),
            (
                'Honda CR-V', 'Honda', 'CR-V', 2023,
                'suv', 'KCH 008H', 'Green', 'petrol', 'automatic', 5, 4,
                '1.5L', 35000, 6500, 600,
                'Spacious family SUV with excellent fuel economy and modern safety features.',
                ['Honda Sensing', 'GPS', 'Heated Seats', 'Wireless Charging'],
                False,
                'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
            ),
            (
                'Ford Transit Van', 'Ford', 'Transit', 2022,
                'van', 'KCI 009I', 'White', 'diesel', 'manual', 9, 4,
                '2.0L', 58000, 5500, 500,
                'Spacious cargo and passenger van, ideal for groups and business use.',
                ['AC', 'Bluetooth', 'Large Boot'],
                False,
                'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
            ),
            (
                'Audi A6', 'Audi', 'A6', 2024,
                'luxury', 'KCJ 010J', 'Grey', 'petrol', 'automatic', 5, 4,
                '2.0L', 22000, 9000, 900,
                'Executive saloon combining elegance, technology and dynamic performance.',
                ['Virtual Cockpit', 'Bang & Olufsen Audio', 'GPS', 'Heated Seats', 'Massage Seats'],
                True,
                'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
            ),
        ]

        for (name, brand, model, year, cat_slug, plate, color, fuel, trans,
             seats, doors, engine, mileage, daily, deposit, desc,
             features, is_featured, img) in vehicles:

            if not Vehicle.query.filter_by(license_plate=plate).first():
                v = Vehicle(
                    name          = name,
                    brand         = brand,
                    model         = model,
                    year          = year,
                    category_id   = cat_map.get(cat_slug, cat_map['sedan']),
                    license_plate = plate,
                    color         = color,
                    fuel_type     = fuel,
                    transmission  = trans,
                    seats         = seats,
                    doors         = doors,
                    engine_size   = engine,
                    mileage       = mileage,
                    daily_rate    = daily,
                    weekly_rate   = daily * 6,
                    monthly_rate  = daily * 25,
                    deposit_amount= deposit,
                    description   = desc,
                    features      = features,
                    is_featured   = is_featured,
                    is_active     = True,
                    status        = 'available',
                    branch_id     = branch_ids[0],
                )
                db.session.add(v)
                db.session.flush()
                if img:
                    db.session.add(VehicleImage(vehicle_id=v.id, url=img, is_primary=True))

        # ── Coupons ───────────────────────────────────────────────────────────
        if not Coupon.query.filter_by(code='WELCOME20').first():
            db.session.add(Coupon(
                code           = 'WELCOME20',
                description    = '20% off for new customers',
                discount_type  = 'percentage',
                discount_value = 20,
                max_discount   = 500,
                valid_from     = datetime.utcnow(),
                valid_until    = datetime.utcnow() + timedelta(days=365),
            ))
        if not Coupon.query.filter_by(code='FLAT50').first():
            db.session.add(Coupon(
                code           = 'FLAT50',
                description    = 'Flat KES 50 off any booking',
                discount_type  = 'fixed',
                discount_value = 50,
                min_amount     = 200,
                valid_from     = datetime.utcnow(),
                valid_until    = datetime.utcnow() + timedelta(days=180),
            ))

        db.session.commit()
        print('✅ Seed complete!')
        print('  Super Admin → admin@drivease.com    / Admin@2025!')
        print('  Manager     → manager@drivease.com  / Manager@2025!')
        print('  Staff       → staff@drivease.com    / Staff@2025!')
        print('  Customer    → john@example.com      / Customer@2025!')

if __name__ == '__main__':
    seed()