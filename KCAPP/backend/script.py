# backend/script.py
import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.test
print("Connected to MongoDB")
