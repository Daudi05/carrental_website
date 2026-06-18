from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from functools import wraps
import uuid
from app import db



def ok(data=None, message='Success', pagination=None):
    r = {'success': True, 'message': message}
    if data is not None:
        r['data'] = data
    if pagination is not None:
        r['pagination'] = pagination
    return jsonify(r), 200


def err(message='Error', code=400):
    return jsonify({'success': False, 'message': message}), code


def created(data=None, message='Created'):
    r = {'success': True, 'message': message}
    if data is not None:
        r['data'] = data
    return jsonify(r), 201


# ── Auth helpers ──────────────────────────────────────────────────────────────

def current_user():
    """Return the currently authenticated User object."""
    from app.models.user import User
    uid = get_jwt_identity()
    if uid is None:
        return None
    try:
        return User.query.get(int(uid))
    except Exception:
        return None


def require_roles(*roles):
    """
    Decorator — restricts a route to users with specific roles.
    Usage:
        @require_roles('admin', 'staff')
        def my_route(): ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            from flask_jwt_extended import verify_jwt_in_request
            try:
                verify_jwt_in_request()
            except Exception:
                return err('Authentication required', 401)

            user = current_user()
            if not user:
                return err('User not found', 404)

            user_role = user.role.name if hasattr(user, 'role') and user.role else ''
            if user_role not in roles:
                return err(f'Access denied. Required role: {", ".join(roles)}', 403)

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ── Pagination helper ─────────────────────────────────────────────────────────

def paginate(query, page=None, per_page=20, max_per_page=100):
    """
    Paginate a SQLAlchemy query using request args or provided values.
    Returns (items, pagination_dict).

    Usage:
        items, pagination = paginate(Vehicle.query.filter_by(is_active=True))
        return ok([v.to_dict() for v in items], pagination=pagination)
    """
    if page is None:
        page = request.args.get('page', 1, type=int)
    per_page = min(
        request.args.get('per_page', per_page, type=int),
        max_per_page
    )
    page = max(1, page)

    total    = query.count()
    items    = query.offset((page - 1) * per_page).limit(per_page).all()
    pages    = (total + per_page - 1) // per_page or 1

    pagination = {
        'total':    total,
        'page':     page,
        'per_page': per_page,
        'pages':    pages,
        'has_next': page < pages,
        'has_prev': page > 1,
    }
    return items, pagination


# ── Reference generator ───────────────────────────────────────────────────────

def generate_ref(prefix='REF'):
    """
    Generate a unique reference number.
    e.g. generate_ref('BK') → 'BK-A1B2C3D4'
    """
    unique = uuid.uuid4().hex[:8].upper()
    return f'{prefix}-{unique}'


# ── Audit logging ─────────────────────────────────────────────────────────────

def audit(action: str, resource: str = None, resource_id: int = None, details: dict = None):
    """
    Log an audit event to the database.
    Silently ignores errors so it never breaks the main request.
    """
    try:
        from app.models import AuditLog
        try:
            uid = get_jwt_identity()
        except Exception:
            uid = None
        entry = AuditLog(
            user_id     = int(uid) if uid else None,
            action      = action,
            resource    = resource,
            resource_id = resource_id,
            details     = details,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        print(f'Audit log error: {e}')