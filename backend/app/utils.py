import random, string
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.models.user import User
from app.models.audit import AuditLog
from app import db


def ok(data=None, msg='OK', code=200, **kwargs):
    r = {'success': True, 'message': msg}
    if data is not None: r['data'] = data
    r.update(kwargs)
    return jsonify(r), code

def created(data=None, msg='Created'): return ok(data, msg, 201)
def err(msg='Error', code=400): return jsonify({'success': False, 'message': msg}), code

def current_user():
    from app.models.user import User
    uid = get_jwt_identity()
    if uid is None:
        return None
    try:
        return User.query.get(int(uid))  # already does int(), so no change needed
    except Exception:
        return None

def require_roles(*roles):
    from functools import wraps
    from flask_jwt_extended import jwt_required, verify_jwt_in_request
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*a, **kw):
            user = current_user()
            if not user or user.role.name not in roles:
                return err('Insufficient permissions', 403)
            if not user.is_active:
                return err('Account deactivated', 403)
            return fn(*a, **kw)
        return wrapper
    return decorator

def paginate(query, page=1, per_page=12):
    p = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items': p.items, 'total': p.total, 'page': p.page,
        'per_page': p.per_page, 'pages': p.pages,
        'has_next': p.has_next, 'has_prev': p.has_prev,
    }

def audit(action, resource=None, resource_id=None, details=None):
    try:
        uid = None
        try: uid = get_jwt_identity()
        except: pass
        log = AuditLog(
            user_id=uid, action=action, resource=resource,
            resource_id=resource_id, details=details,
            ip_address=request.headers.get('X-Forwarded-For', request.remote_addr),
            user_agent=request.headers.get('User-Agent','')[:500],
        )
        db.session.add(log)
        db.session.commit()
    except: pass

def generate_ref(prefix='REF', length=8):
    return prefix + ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
