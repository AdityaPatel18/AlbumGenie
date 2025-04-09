from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import ARRAY, create_engine, Column, Integer, String, LargeBinary, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import cv2
import base64
import time
from fastapi.responses import FileResponse
import tempfile
import zipfile
import os
import shutil

import numpy as np
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity

DATABASE_URL = "postgresql://user:password@postgres/albumgenie"
Base = declarative_base()
from fastapi.middleware.cors import CORSMiddleware

class FileModel(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filedata = Column(LargeBinary)
    individuals = Column(ARRAY(String), nullable=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

global_face_context = {
    "embeddings": [],  # List of facial embeddings
    "labels": [],
    "face": [],              # List of corresponding person labels
}

def extract_face_embedding(image):
    try:
        embedding = DeepFace.represent(image, model_name="Facenet", enforce_detection=False)
        return embedding[0]["embedding"]
    except Exception as e:
        print(f"Error extracting embedding: {e}")
        return None

def preprocessor(file_content: bytes) -> list:
        print("Starting preprocessor...")
        image_array = np.frombuffer(file_content, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            print("Failed to decode image")
            return []
            
        print(f"Image shape: {image.shape}")

        cropped_faces = detect_crop_faces(image)
        print(f"Detected {len(cropped_faces)} faces")

        person_labels = []

        for face in cropped_faces:
            embedding = extract_face_embedding(face)

            if embedding is None:
                continue
            
            if global_face_context["embeddings"]:
                similarities = cosine_similarity([embedding], global_face_context["embeddings"])
                max_similarity_index = similarities.argmax()
                max_similarity = similarities[0][max_similarity_index]

                if max_similarity > 0.6:
                    person_labels.append(global_face_context["labels"][max_similarity_index])
                    continue
            new_label = f"Person {len(global_face_context['labels']) + 1}"
            global_face_context["embeddings"].append(embedding)
            global_face_context["labels"].append(new_label)
            global_face_context["face"].append(face)
            person_labels.append(new_label)
        return person_labels


def detect_crop_faces(image):
    try:
        face_objs = DeepFace.extract_faces(image, detector_backend="opencv")

    except Exception as e:
        print(f"Error detecting any faces {e}")
        return []
    cropped_faces = []
    for face_obj in face_objs:
        x, y, w, h = face_obj["facial_area"]["x"], face_obj["facial_area"]["y"], \
                      face_obj["facial_area"]["w"], face_obj["facial_area"]["h"]
        cropped_face = image[y:y+h, x:x+w]
        cropped_faces.append(cropped_face)

    return cropped_faces


@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    try:
        if not files:
            return JSONResponse(content={"message": "No files uploaded"}, status_code=400)
        
        uploaded_files = []
        for file in files:
            file_content = await file.read()
            
            print(f"Uploading: {file.filename}")
            print(f"File Size: {len(file_content)} bytes")
            print(f"Content Type: {file.content_type}")
            
            person_attributes = preprocessor(file_content)
            db_file = FileModel(
                filename=file.filename, 
                filedata=file_content,
                individuals = person_attributes
            )
            db.add(db_file)
            uploaded_files.append(file.filename)
        db.commit()
        
        return JSONResponse(
            content={
                "message": "Files uploaded successfully!", 
                "uploaded_files": uploaded_files
            }, 
            status_code=200
        )
    
    except Exception as e:
        db.rollback()
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")
    
@app.get("/files")
async def list_files(db: Session = Depends(get_db)):
    try:
        files = db.query(FileModel).all()
        file_list = [
            {
                "id": file.id, 
                "filename": file.filename, 
                "individuals": file.individuals,
                "file_size": len(file.filedata) if file.filedata else 0
            } for file in files
        ]
        return JSONResponse(content={"files": file_list})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving files: {str(e)}")

@app.post("/reset-database")
async def reset_database(db: Session = Depends(get_db)):
    try:
        db.execute(text("TRUNCATE TABLE files RESTART IDENTITY CASCADE"))
        db.commit()
        global_face_context["embeddings"].clear()
        global_face_context["labels"].clear()
        return {"message": "Database and global context reset successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resetting database: {str(e)}")


@app.get("/images")
def get_image(db: Session = Depends(get_db)):
    time.sleep(10)
    files = db.query(FileModel).all()
    image_list = []
    for file in files:
        # Decode the binary image data to Base64
        image_data = base64.b64encode(file.filedata).decode("utf-8")
        image_list.append({
            "id": file.id,
            "individuals": file.individuals,
            "image_data": image_data 
        })
    
    return {"images": image_list}

@app.get("/filter_options")
def get_options():
    return global_face_context["labels"]


@app.post("/apply_filter")
def apply_filter(people: list[str] ,db:Session = Depends(get_db)):
    files = db.query(FileModel).all()
    image_list = []
    print(people)
    for file in files:
        print(file.individuals)
        if all(person in file.individuals for person in people):
            image_data = base64.b64encode(file.filedata).decode("utf-8")
            image_list.append({
                "id": file.id,
                "individuals": file.individuals,
                "image_data": image_data 
            })
    print(image_list)
    return {"images": image_list}

@app.get("/get_faces")
def get_faces():
    face_images = []
    for face, label in zip(global_face_context["face"], global_face_context["labels"]):
        _, buffer = cv2.imencode('.jpg', face)
        face_base64 = base64.b64encode(buffer).decode('utf-8')
        face_images.append({
            "image_data": face_base64,
            "label": label
        })
    return {"images": face_images}



@app.post("/identify_individual")
def identify_individual():
    for i in range(len(global_face_context["labels"])):
        if i < len(global_face_context):
            global_face_context[i]["labels"].append(files[i]["name"])
        else:
            print(f"No face context found for file: {files[i]['name']}")

    return None

@app.post("/update_faces")
def update_faces(faces_data: dict, db: Session = Depends(get_db)):
    try:
        # Extract name changes from request
        updated_faces = faces_data.get("faces", [])
        name_changes = {}
        
        # Update in-memory face context and build name mapping
        for i, face in enumerate(updated_faces):
            if i < len(global_face_context["labels"]):
                old_name = global_face_context["labels"][i]
                new_name = face.get("name", old_name)
                
                if old_name != new_name:
                    name_changes[old_name] = new_name
                    global_face_context["labels"][i] = new_name
        
        # Update database with a single SQL query for each name change
        for old_name, new_name in name_changes.items():
            db.execute(
                text("UPDATE files SET individuals = array_replace(individuals, :old_name, :new_name)"),
                {"old_name": old_name, "new_name": new_name}
            )
        
        db.commit()
        return
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
@app.post("/create_folder")
def create_folder(selected_ids: list[int], db: Session = Depends(get_db)):
    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "images.zip")

    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_id in selected_ids:
            file = db.query(FileModel).filter(FileModel.id == file_id).first()
            if file:
                file_name = f"image_{file.id}.jpg"
                image_path = os.path.join(temp_dir, file_name)
                with open(image_path, "wb") as f:
                    f.write(file.filedata)
                zipf.write(image_path, arcname=file_name)

    return FileResponse(zip_path, media_type="application/zip", filename="images.zip")