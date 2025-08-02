FROM openjdk:17-jdk-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends bash coreutils g++ python3 bc \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /sandbox

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
