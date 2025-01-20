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
import org.litote.kmongo.KMongo
import org.litote.kmongo.eq
import org.litote.kmongo.findOne
import org.litote.kmongo.getCollection
import java.time.Duration
import kotlin.time.Duration.Companion.seconds

fun validateUser(username: String, password: String): User? {
    val client = KMongo.createClient()
    val database = client.getDatabase("Users")
    val collection = database.getCollection<User>()

    return collection.findOne(User::username eq username, User::password eq password)
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
    }


}