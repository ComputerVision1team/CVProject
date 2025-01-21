package com

import com.mongodb.client.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import org.litote.kmongo.KMongo
import org.litote.kmongo.eq
import org.litote.kmongo.findOne
import org.litote.kmongo.getCollection
import org.litote.kmongo.setValue
import java.io.File
import java.util.*

@Serializable
data class GazeData(val userId: String, val screenshot: String, val timestamp: String, val count: Int)


fun Application.configureDatabases() {
    install(ContentNegotiation) {
        json()
    }
    val (userDatabase, warningsDatabase) = connectToMongoDB()
    val userService = UserService(userDatabase)
    routing {
        // Create user
        post("/users") {
            val user = call.receive<User>()
            val id = userService.create(user)
            call.respond(HttpStatusCode.Created, id)
        }
        // Read user
        get("/users/{id}") {
            val id = call.parameters["id"] ?: throw IllegalArgumentException("No ID found")
            userService.read(id)?.let { user ->
                call.respond(user)
            } ?: call.respond(HttpStatusCode.NotFound)
        }
        // Update user
        put("/users/{id}") {
            val id = call.parameters["id"] ?: throw IllegalArgumentException("No ID found")
            val user = call.receive<User>()
            userService.update(id, user)?.let {
                call.respond(HttpStatusCode.OK)
            } ?: call.respond(HttpStatusCode.NotFound)
        }
        // Delete user
        delete("/users/{id}") {
            val id = call.parameters["id"] ?: throw IllegalArgumentException("No ID found")
            userService.delete(id)?.let {
                call.respond(HttpStatusCode.OK)
            } ?: call.respond(HttpStatusCode.NotFound)
        }
        // Save gaze data
        post("/gaze-data") {
            val gazeData = call.receive<GazeData>()
            val filePath = saveScreenshot(gazeData.screenshot)
            val updatedGazeData = gazeData.copy(screenshot = filePath)
            saveGazeData(warningsDatabase, updatedGazeData, userService)
            call.respond(HttpStatusCode.OK)
        }
    }
}

fun saveScreenshot(dataUrl: String): String {
    val base64Image = dataUrl.split(",")[1]
    val imageBytes = Base64.getDecoder().decode(base64Image)
    val filePath = "screenshots/${UUID.randomUUID()}.png"
    File(filePath).writeBytes(imageBytes)
    return filePath
}
suspend fun saveGazeData(database: MongoDatabase, gazeData: GazeData, userService: UserService) {
    val warningsCollection = database.getCollection<GazeData>("warnings")
    warningsCollection.insertOne(gazeData)

    val usersCollection = database.getCollection<User>("users")
    val user = usersCollection.findOne(User::user_id eq gazeData.userId)
    if (user != null) {
        val newWarningCount = user.warning_count + 1
        userService.updateWarningCount(user.user_id, newWarningCount)
    }
}

fun Application.connectToMongoDB(): Pair<MongoDatabase, MongoDatabase> {
    val user = environment.config.tryGetString("db.mongo.user")
    val password = environment.config.tryGetString("db.mongo.password")
//    val host = environment.config.tryGetString("db.mongo.host") ?: "192.168.45.5"
    val host = environment.config.tryGetString("db.mongo.host") ?: "localhost"
    val port = environment.config.tryGetString("db.mongo.port") ?: "27017"
    val maxPoolSize = environment.config.tryGetString("db.mongo.maxPoolSize")?.toInt() ?: 20
    val userDatabaseName = environment.config.tryGetString("db.mongo.database.name") ?: "Users"
    val warningsDatabaseName = "Warnings"

    val credentials = user?.let { userVal -> password?.let { passwordVal -> "$userVal:$passwordVal@" } }.orEmpty()
    val uri = "mongodb://$credentials$host:$port/?maxPoolSize=$maxPoolSize&w=majority"

    val mongoClient = MongoClients.create(uri)
    val userDatabase = mongoClient.getDatabase(userDatabaseName)
    val warningsDatabase = mongoClient.getDatabase(warningsDatabaseName)

    monitor.subscribe(ApplicationStopped) {
        mongoClient.close()
    }

    return Pair(userDatabase, warningsDatabase)
}
