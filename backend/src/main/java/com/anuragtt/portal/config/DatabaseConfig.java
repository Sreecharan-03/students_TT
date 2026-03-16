package com.anuragtt.portal.config;

import com.zaxxer.hikari.HikariDataSource;
import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    public HikariDataSource dataSource(DataSourceProperties dataSourceProperties) {
        String databaseUrl = resolveDatabaseUrl();
        URI uri = URI.create(databaseUrl);
        String[] credentials = uri.getUserInfo().split(":", 2);
        String username = decode(credentials[0]);
        String password = credentials.length > 1 ? decode(credentials[1]) : "";
        String query = uri.getQuery();
        String normalizedQuery = query == null ? "" : query.replace("channel_binding=", "channelBinding=");
        String jdbcUrl = "jdbc:postgresql://"
            + uri.getHost()
            + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
            + uri.getPath()
            + (normalizedQuery.isBlank() ? "" : "?" + normalizedQuery);

        HikariDataSource dataSource = dataSourceProperties.initializeDataSourceBuilder()
            .type(HikariDataSource.class)
            .build();

        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }

    private String resolveDatabaseUrl() {
        List<String> directSources = List.of(
            System.getenv("DATABASE_URL") == null ? "" : System.getenv("DATABASE_URL"),
            System.getProperty("DATABASE_URL") == null ? "" : System.getProperty("DATABASE_URL")
        );

        for (String source : directSources) {
            if (!source.isBlank()) {
                return source;
            }
        }

        for (Path envPath : List.of(Path.of(".env"), Path.of("backend", ".env"))) {
            if (!Files.exists(envPath)) {
                continue;
            }

            try {
                for (String line : Files.readAllLines(envPath)) {
                    String trimmedLine = line.trim();

                    if (trimmedLine.startsWith("DATABASE_URL=")) {
                        return trimmedLine.substring("DATABASE_URL=".length());
                    }
                }
            } catch (IOException exception) {
                throw new IllegalStateException("Unable to read " + envPath, exception);
            }
        }

        throw new IllegalStateException("DATABASE_URL was not found in environment variables or .env files");
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}