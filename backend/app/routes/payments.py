from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app import db
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.notification import Notification
from app.utils import ok, err, current_user, require_roles, audit, generate_ref

payments_bp = Blueprint('payments', __name__)


@payments_bp.post('/process')
@jwt_required()
def process_payment():
    user = current_user()
    d    = request.get_json() or {}
    booking_id = d.get('booking_id')
    method     = d.get('method','cash')
    amount     = d.get('amount')
    if not booking_id or not amount:
        return err('booking_id and amount required')

    booking = Booking.query.filter_by(id=booking_id, customer_id=user.id).first()
    if not booking: return err('Booking not found', 404)
    if booking.status not in ('pending','confirmed'):
        return err('Payment not applicable for this booking status')

    payment = Payment(
        payment_ref  = generate_ref('PAY'),
        booking_id   = booking.id,
        customer_id  = user.id,
        amount       = float(amount),
        method       = method,
        status       = 'completed',
        paid_at      = datetime.utcnow(),
        notes        = d.get('notes',''),
    )
    db.session.add(payment)

    if booking.status == 'pending':
        booking.status = 'confirmed'

    db.session.add(Notification(
        user_id = user.id,
        title   = 'Payment Confirmed',
        message = f'Payment of ${amount} for booking {booking.booking_ref} received.',
        type    = 'success',
    ))
    db.session.commit()
    audit('PAYMENT_PROCESSED', 'payments', payment.id, {'amount': amount, 'method': method})
    return ok(payment.to_dict(), 'Payment processed successfully')


@payments_bp.get('/my')
@jwt_required()
def my_payments():
    user = current_user()
    payments = Payment.query.filter_by(customer_id=user.id).order_by(Payment.created_at.desc()).limit(20).all()
    return ok([p.to_dict() for p in payments])


@payments_bp.get('')
@require_roles('super_admin','branch_manager')
def all_payments():
    page = request.args.get('page', 1, type=int)
    from app.utils import paginate
    q = Payment.query.order_by(Payment.created_at.desc())
    result = paginate(q, page, 20)
    return ok([p.to_dict() for p in result['items']],
              pagination={k: result[k] for k in ['total','page','pages']})
