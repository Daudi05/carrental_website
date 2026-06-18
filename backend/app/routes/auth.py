from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime
from app import db, bcrypt, limiter
from app.models.user import User, Role
from app.models.notification import Notification
from app.utils import ok, err, created, current_user, audit

auth_bp = Blueprint('auth', __name__)


def make_tokens(user):
    return (create_access_token(identity=str(user.id)),
            create_refresh_token(identity=str(user.id)))


@auth_bp.post('/register')
@limiter.limit('5 per hour')
def register():
    d = request.get_json() or {}
    required = ['first_name','last_name','email','password']
    if not all(d.get(f) for f in required):
        return err('All required fields must be filled')
    if len(d['password']) < 8:
        return err('Password must be at least 8 characters')
    if User.query.filter_by(email=d['email'].lower()).first():
        return err('Email already registered', 409)

    customer_role = Role.query.filter_by(name='customer').first()
    pw = bcrypt.generate_password_hash(d['password']).decode()
    user = User(
        first_name = d['first_name'].strip(),
        last_name  = d['last_name'].strip(),
        email      = d['email'].lower().strip(),
        phone      = d.get('phone',''),
        password   = pw,
        role_id    = customer_role.id if customer_role else 4,
    )
    db.session.add(user)
    db.session.flush()

    db.session.add(Notification(
        user_id = user.id,
        title   = 'Welcome to DriveEase!',
        message = f'Hello {user.first_name}! Your account has been created successfully.',
        type    = 'success',
    ))
    db.session.commit()

    access, refresh = make_tokens(user)
    audit('USER_REGISTERED', 'users', user.id)
    return created({'access_token': access, 'refresh_token': refresh, 'user': user.to_dict()},
                   'Account created successfully')


@auth_bp.post('/login')
@limiter.limit('10 per minute')
def login():
    d     = request.get_json() or {}
    email = (d.get('email') or '').lower().strip()
    pw    = d.get('password','')
    if not email or not pw:
        return err('Email and password required')

    user = User.query.filter_by(email=email).first()

    if user and user.locked_until and user.locked_until > datetime.utcnow():
        return err(f'Account locked until {user.locked_until.strftime("%H:%M")}', 403)

    if not user or not bcrypt.check_password_hash(user.password, pw):
        if user:
            user.login_attempts = (user.login_attempts or 0) + 1
            if user.login_attempts >= 5:
                from datetime import timedelta
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.session.commit()
        return err('Invalid email or password', 401)

    if not user.is_active:
        return err('Account deactivated. Contact support.', 403)

    user.login_attempts = 0
    user.locked_until   = None
    user.last_login     = datetime.utcnow()
    db.session.commit()

    access, refresh = make_tokens(user)
    audit('USER_LOGIN', 'users', user.id)
    return ok({'access_token': access, 'refresh_token': refresh, 'user': user.to_dict()},
              'Login successful')


@auth_bp.post('/refresh')
@jwt_required(refresh=True)
def refresh():
    uid  = get_jwt_identity()
    user = User.query.get(int(uid))
    if not user or not user.is_active:
        return err('User not found', 401)
    return ok({'access_token': create_access_token(identity=str(uid))})


@auth_bp.get('/me')
@jwt_required()
def me():
    user = current_user()
    if not user: return err('Not found', 404)
    return ok(user.to_dict(include_sensitive=True))


@auth_bp.put('/profile')
@jwt_required()
def update_profile():
    user = current_user()
    d    = request.get_json() or {}
    for f in ['first_name','last_name','phone','address','city','country',
              'license_number','id_number']:
        if f in d: setattr(user, f, d[f])
    db.session.commit()
    audit('PROFILE_UPDATED', 'users', user.id)
    return ok(user.to_dict(include_sensitive=True), 'Profile updated')


@auth_bp.post('/change-password')
@jwt_required()
def change_password():
    user   = current_user()
    d      = request.get_json() or {}
    old_pw = d.get('old_password','')
    new_pw = d.get('new_password','')
    if len(new_pw) < 8:
        return err('Password must be at least 8 characters')
    if not bcrypt.check_password_hash(user.password, old_pw):
        return err('Current password is incorrect', 401)
    user.password = bcrypt.generate_password_hash(new_pw).decode()
    db.session.commit()
    return ok(message='Password changed successfully')