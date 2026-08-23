FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src

# Build xong chọn đúng boot-jar (loại original-*.jar)
RUN set -eux; \
    mvn -q -DskipTests package; \
    echo "=== Target files ==="; ls -la target; \
    JAR="$(find target -maxdepth 1 -type f -name '*.jar' ! -name 'original-*.jar' | head -n 1)"; \
    echo "Using JAR: $JAR"; \
    cp "$JAR" /app/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
