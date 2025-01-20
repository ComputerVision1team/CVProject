package com

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.http.content.*
import io.ktor.server.jetty.jakarta.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Jetty, port = 8080, host = "127.0.0.1", module = Application::module)
        .start(wait = true)
}


fun Application.module() {
    configureSockets()
    configureSerialization()
    configureDatabases()
    //configureHTTP()
    configureRouting()
    configureStatic()
}




