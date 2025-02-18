FROM ubuntu:22.04

# Install required packages
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    jq \
    tzdata \
    sed \
    grep \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Copy script
COPY sign_data.sh /usr/local/bin/

# Set execution permissions
RUN chmod +x /usr/local/bin/sign_data.sh

# Set environment variables
ENV CERTS_DIR=/sp/certs
ENV OUTPUT_DIR=/sp/output

# Set working directory
WORKDIR /sp

# Set entrypoint to sign_data.sh
ENTRYPOINT ["sign_data.sh", "crypto"]
