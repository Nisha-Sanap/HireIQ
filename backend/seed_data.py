"""
Seed script — Populates the database with a test user.
Run: python seed_data.py
"""

import asyncio
import sys
import os

# Add parent dir so imports work when run from backend/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from services.auth_service import hash_password
from datetime import datetime


async def seed():
    """Create a test recruiter user."""
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    # Check if test user exists
    existing = await db.users.find_one({"email": "admin@resumeai.com"})
    if existing:
        print("✅ Test user already exists:")
        print(f"   Email:    admin@resumeai.com")
        print(f"   Password: admin123")
        client.close()
        return

    # Create test user
    user_doc = {
        "name": "Admin Recruiter",
        "email": "admin@resumeai.com",
        "hashed_password": hash_password("admin123"),
        "role": "recruiter",
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_doc)
    print("✅ Test user created successfully!")
    print(f"   ID:       {result.inserted_id}")
    print(f"   Email:    admin@resumeai.com")
    print(f"   Password: admin123")

    # Ensure indexes
    await db.users.create_index("email", unique=True)
    await db.resumes.create_index("user_id")
    await db.jobs.create_index("user_id")
    await db.rankings.create_index([("job_id", 1), ("rank", 1)])

    print("✅ Database indexes created")
    print(f"\n🚀 Ready! Login at http://localhost:3000 with the credentials above.")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
