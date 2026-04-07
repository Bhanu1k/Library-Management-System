package com.library.config;

import com.library.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:https://librarymanagementsystemai.netlify.app}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET,    "/api/profile/me").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/profile/me").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/profile/me/picture").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/profile/me/picture").authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/profile/me/password").authenticated()
                .requestMatchers("/api/profile/users/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.GET,    "/api/books/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/books/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.PUT,    "/api/books/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasRole("ADMIN")
                .requestMatchers("/api/members/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.GET,  "/api/loans/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/loans/borrow/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/loans/issue").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.POST, "/api/loans/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers(HttpMethod.PUT,  "/api/loans/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}