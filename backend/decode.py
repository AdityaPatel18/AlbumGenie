from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import psycopg2
from io import BytesIO

# Database setup (adjust these parameters as needed)
DATABASE_URL = "postgresql://user:password@postgres/albumgenie"
Base = declarative_base()
from fastapi.middleware.cors import CORSMiddleware

# Define the File model for the database
class FileModel(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filedata = Column(LargeBinary)

# Create an engine and session for interacting with the database
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the table in the database
Base.metadata.create_all(bind=engine)

# FastAPI app instance
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    try:
        for file in files:
            file_content = await file.read()
            db_file = FileModel(filename=file.filename, filedata=file_content)
            db.add(db_file)

        db.commit()  # Commit all files at once
        return JSONResponse(content={"message": "Files uploaded successfully!"}, status_code=200)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error uploading files: " + str(e))
