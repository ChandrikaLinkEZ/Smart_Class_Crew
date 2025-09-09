from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import httpx 
from fastapi import FastAPI

app = FastAPI()

# Connect to MongoDB (FastAPI async driver)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["smartclasscrew"]

# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginCredential(BaseModel):
    email: EmailStr
    role: str
    usn: str | None = None

# ---------------- LOGIN ----------------
@app.post("/api/login")
async def login(payload: dict = Body(...)):
    creds = LoginCredential(**payload["LoginCredential"])
    user = await db["user"].find_one({"email": creds.email, "role": creds.role})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if creds.role == "student":
        if not creds.usn:
            raise HTTPException(status_code=400, detail="USN is required for students")

        student = await db["user"].find_one({"usn": creds.usn})
        if not student:
            raise HTTPException(status_code=401, detail="Invalid USN")

    return {
        "message": "Login successful",
        "user": {
            "id": user.get("sl_no"),
            "role": user.get("role"),
            "email": user.get("email"),
            "name": user.get("display_name"),
            "usn": user.get("usn", None)
        }
    }

# ---------------- STATS ----------------
@app.get("/api/stats")
async def get_stats():
    students_count = await db["user"].count_documents({"role": "student"})
    teachers_count = await db["user"].count_documents({"role": "teacher"})

    male_students = await db["user"].count_documents({"role": "student", "gender": "male"})
    female_students = await db["user"].count_documents({"role": "student", "gender": "female"})

    male_percent = (male_students / students_count * 100) if students_count > 0 else 0
    female_percent = (female_students / students_count * 100) if students_count > 0 else 0

    return {
        "students_count": students_count,
        "teachers_count": teachers_count,
        "male_students": male_students,
        "female_students": female_students,
        "male_percent": round(male_percent, 2),
        "female_percent": round(female_percent, 2),
    }

# ---------------- NOTICES ----------------
@app.get("/api/notices")
async def get_notices():
    notices_cursor = db["notices"].find()
    notices = []
    async for notice in notices_cursor:
        notice["_id"] = str(notice["_id"])
        # Ensure date is string (YYYY-MM-DD)
        if isinstance(notice["date"], datetime):
            notice["date"] = notice["date"].strftime("%Y-%m-%d")
        notices.append(notice)
    return notices
 
 
 #---------------HOLIDAYS---------------
@app.get("/api/holidays")
async def get_holidays():
    holidays = await db["holidays"].find().to_list(100)  # fetch max 100 holidays
    return [
        {
            "date": h.get("date"),
            "title": h.get("title")
        }
        for h in holidays
    ]
