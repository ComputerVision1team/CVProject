package com

import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import org.bson.Document
import org.bson.types.ObjectId

@Serializable
data class User(
    val userId: String,
    val username: String,
    val password: String,
    val warning_count: Int = 0,
    val screenshots: List<String> = emptyList()
//    val role: String
) {
    fun toDocument(): Document = Document.parse(Json.encodeToString(this))

    companion object {
        private val json = Json { ignoreUnknownKeys = true }

        fun fromDocument(document: Document): User = json.decodeFromString(document.toJson())
    }
}

class UserService(private val database: MongoDatabase) {
    var collection: MongoCollection<Document>

    init {
        val collectionNames = database.listCollectionNames().into(mutableListOf())
        if ("users" !in collectionNames) {
            database.createCollection("users")
        }
        collection = database.getCollection("users")
    }

    // Create new user
    suspend fun create(user: User): String = withContext(Dispatchers.IO) {
        val doc = user.toDocument()
        collection.insertOne(doc)
        doc["_id"].toString()
    }

    // Read a user
    suspend fun read(id: String): User? = withContext(Dispatchers.IO) {
        collection.find(Filters.eq("_id", ObjectId(id))).first()?.let(User::fromDocument)
    }

    // Update a user
    suspend fun update(id: String, user: User): Document? = withContext(Dispatchers.IO) {
        collection.findOneAndReplace(Filters.eq("_id", ObjectId(id)), user.toDocument())
    }

    // Update warning count
    suspend fun updateWarningCount(id: String, warningCount: Int): Document? = withContext(Dispatchers.IO) {
        collection.findOneAndUpdate(
            Filters.eq("_id", ObjectId(id)),
            Document("\$set", Document("warning_count", warningCount))
        )
    }

    // Delete a user
    suspend fun delete(id: String): Document? = withContext(Dispatchers.IO) {
        collection.findOneAndDelete(Filters.eq("_id", ObjectId(id)))
    }
}

