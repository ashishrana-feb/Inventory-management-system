from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from database import get_db
from models import Product, Customer, Order, OrderItem
from schemas import DashboardStats

router = APIRouter()

LOW_STOCK_THRESHOLD = 10


@router.get("", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0

    low_stock = (
        db.query(Product)
        .filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity.asc())
        .limit(10)
        .all()
    )

    recent_orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock,
        recent_orders=recent_orders
    )
