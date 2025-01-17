# Build stage
FROM gradle:jdk21 as builder
WORKDIR /app
COPY . .
RUN gradle build --no-daemon

# Run stage
FROM openjdk:21-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]