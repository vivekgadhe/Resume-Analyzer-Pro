from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()
cors = CORS()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()