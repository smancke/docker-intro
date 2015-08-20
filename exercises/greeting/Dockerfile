
FROM ubuntu

ENV message='Hallo'

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y figlet && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT echo " $message $0" | figlet
CMD ["Marvin"]
