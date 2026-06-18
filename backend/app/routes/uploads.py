import os, uuid
from flask import Blueprint, request, send_from_directory, current_app
from flask_jwt_extended import jwt_required
from app.utils import ok, err

uploads_bp = Blueprint('uploads', __name__)
ALLOWED    = {'png','jpg','jpeg','webp','gif'}


@uploads_bp.post('')
@jwt_required()
def upload():
    if 'file' not in request.files: return err('No file provided')
    file = request.files['file']
    ext  = (file.filename or '').rsplit('.',1)[-1].lower()
    if ext not in ALLOWED: return err(f'File type .{ext} not allowed')
    filename = f'{uuid.uuid4().hex}.{ext}'
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    return ok({'url': f'/api/uploads/{filename}'}, code=201)


@uploads_bp.get('/<filename>')
def serve(filename):
    filename = os.path.basename(filename)
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
