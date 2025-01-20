package com

import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*


fun Application.configureStatic() {
    routing {
        static("/CSS") {
            resources("static/CSS")
        }
        static("/HTML") {
            resources("static/HTML")
        }
        static("/JS") {
            resources("static/JS")
        }
        static("/images") {
            resources("static/images")
        }
    }
}
