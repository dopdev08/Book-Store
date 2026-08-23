package com.comicstore.comicstore_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;//Docker
import org.springframework.web.cors.CorsConfigurationSource;//Docker
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;//Docker
import java.util.List;//Docker
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))//Docker
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                    // ====== AUTH ======
                    .requestMatchers("/api/auth/**").permitAll()

                    // ✅ ADMIN endpoints (ưu tiên trước để không bị permitAll của comics GET nuốt)
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/comics/admin/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/comics/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/comics/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/comics/**").hasRole("ADMIN")

                    // ====== COMIC – ai cũng xem được (chỉ GET public) ======
                    .requestMatchers(HttpMethod.GET, "/api/comics/**").permitAll()

                    // ====== REVIEW ======
                    .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                    .requestMatchers(HttpMethod.GET,"/api/reviews/my").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/api/reviews/**").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasAnyRole("USER", "ADMIN")

                    // ====== UPLOAD – chỉ ADMIN ======
                    .requestMatchers(HttpMethod.POST, "/api/upload/**").hasRole("ADMIN")
                    /// Admin không mua hàng
                    // .requestMatchers("/api/cart/**").hasRole("USER")

                    // ====== CÁC API KHÁC: bắt buộc đăng nhập ======
                    .anyRequest().authenticated()
            )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean//Docker
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173","https://comicstore-frontend.pages.dev","https://*.comicstore-frontend.pages.dev"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }//Docker

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

