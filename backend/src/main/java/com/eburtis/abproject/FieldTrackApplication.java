package com.eburtis.abproject;

import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;


import static io.swagger.v3.oas.annotations.enums.SecuritySchemeIn.HEADER;
import static io.swagger.v3.oas.annotations.enums.SecuritySchemeType.APIKEY;

@SpringBootApplication
@SecurityScheme(name = "Authorization", scheme = "basic", type = APIKEY, in = HEADER)
public class FieldTrackApplication extends SpringBootServletInitializer {
	public static final Logger log = LoggerFactory.getLogger(FieldTrackApplication.class);

	public static void main(String[] args) {

		SpringApplication.run(FieldTrackApplication.class, args);

		log.info("""
            
            ************************************************************************************************
            
                  ✨🔥🚀   WELCOME TO FieldTrack Pro   🚀🔥✨
            
            ╔══════════════════════════════════════════════════════════════════════════════════════════════╗
            ║                                                                                              ║
            ║     ███████╗██╗███████╗██╗     ██████╗ ████████╗██████╗  █████╗  ██████╗██╗  ██╗              ║
            ║     ██╔════╝██║██╔════╝██║     ██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝              ║
            ║     █████╗  ██║█████╗  ██║     ██████╔╝   ██║   ██████╔╝███████║██║     █████╔╝               ║
            ║     ██╔══╝  ██║██╔══╝  ██║     ██╔══██╗   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗               ║
            ║     ██║     ██║███████╗███████╗██████╔╝   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗              ║
            ║     ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝              ║
            ║                                                                                              ║
            ║   🚀 WELCOME TO FieldTrack Pro — LET'S GO! 🎉                                             ║
            ║                                                                                              ║
            ╚══════════════════════════════════════════════════════════════════════════════════════════════╝
            
                 ✅ Environment : Production / Dev / Test
                 ✅ Started at  : {}
            
            ************************************************************************************************
            """, java.time.LocalDateTime.now());
	}


	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(FieldTrackApplication.class);
	}

}
