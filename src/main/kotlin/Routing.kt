package com

import com.mongodb.client.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.http.content.*
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
import org.slf4j.LoggerFactory
import java.time.Duration
import kotlin.time.Duration.Companion.seconds

@Serializable
data class Admin(
    val admin_id: String,
    val adminname: String,
    val adminpassword: String
)

fun validateUser(username: String, password: String): User? {
    val logger = LoggerFactory.getLogger("validateUser")
//    val client = KMongo.createClient("mongodb://192.168.45.5:27017")
    val client = KMongo.createClient("mongodb://localhost:27017")
    val database = client.getDatabase("Users")
    val collection = database.getCollection<User>("users")

    return try {
        val user = collection.findOne(User::username eq username, User::password eq password)
        if (user == null) {
            logger.info("No matching user found for username: $username")
        }
        user
    } catch (e: Exception) {
        logger.error("Error validating user", e)
        null
    }
}

fun validateAdmin(username: String, password: String): Admin? {
    val logger = LoggerFactory.getLogger("validateAdmin")
    val client = KMongo.createClient("mongodb://localhost:27017")
    val database = client.getDatabase("Admins")
    val collection = database.getCollection<Admin>("admins")

    return try {
        val admin = collection.findOne(Admin::adminname eq username, Admin::adminpassword eq password)
        if (admin == null) {
            logger.info("No matching admin found for username: $username")
        }
        admin
    } catch (e: Exception) {
        logger.error("Error validating admin", e)
        null
    }
}

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondRedirect("/HTML/mainscreen.html")
        }


        post("/login") {
            val parameters = call.receiveParameters()
            val username = parameters["username"]
            val password = parameters["password"]

            if (username != null && password != null) {
                val user = validateUser(username, password)
                if (user != null) {
                    call.respond(HttpStatusCode.OK)
                } else {
                    call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
                }
            } else {
                call.respond(HttpStatusCode.BadRequest, "Missing username or password")
            }
        }

        post("/admin/login") {
            val parameters = call.receiveParameters()
            val username = parameters["username"]
            val password = parameters["password"]

            if (username != null && password != null) {
                val admin = validateAdmin(username, password)
                if (admin != null) {
                    call.respond(HttpStatusCode.OK)
                } else {
                    call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
                }
            } else {
                call.respond(HttpStatusCode.BadRequest, "Missing username or password")
            }
        }
    }
}