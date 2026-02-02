package com.eburtis.abproject.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

	@Value("${client.base_url.local}")
	private String clientLocal;

	@Value("${client.base_url.online}")
	private String clientOnline;

	@Value("${client.base_url.flutter:http://localhost:4300}")
	private String clientFlutter;

	@Value("${client.base_url.mobile:http://192.168.11.111:8073}")
	private String clientMobile;

	@Value("${client.base_url.ngrok:}")
	private String clientNgrok;

	@Value("${photo.windows_base_path}")
	public String windowsBasePath;

	@Value("${photo.linux_base_path}")
	public String linuxBasePath;

	@Value("${file.upload.base_path}")
	public String basePath;

	@Override
	public void addCorsMappings(CorsRegistry corsRegistry) {
		// Construire la liste des origines autorisées
		java.util.List<String> allowedOrigins = new java.util.ArrayList<>();
		allowedOrigins.add(clientLocal);
		allowedOrigins.add(clientOnline);
		allowedOrigins.add(clientFlutter);
		allowedOrigins.add(clientMobile);
		
		// Ajouter ngrok si configuré
		if (clientNgrok != null && !clientNgrok.isEmpty() && !clientNgrok.equals("https://VOTRE_URL_NGROK.ngrok-free.app")) {
			allowedOrigins.add(clientNgrok);
		}
		
		corsRegistry.addMapping("/**")
				.allowedOrigins(allowedOrigins.toArray(new String[0]))
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
				.maxAge(3600L)
				.allowedHeaders("*")
				.exposedHeaders("Authorization")
				.allowCredentials(true);
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/fichiers/**")
				.addResourceLocations(
						System.getProperty("os.name").startsWith("Windows") ?
								"file:///" + basePath.replace("\\", "/")+ "/" :
								"file:" + basePath + "/"
				);
	}
}
