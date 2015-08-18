
Docker Into
===============

This is an Docker introduction slide deck:

Slides: <http://smancke.github.io/docker-intro>

Source <https://github.com/smancke/docker-intro>

Contents:
----------
1. __Intro__
1. __Command line interface__
1. __Dockerfiles__
1. __docker-compose__

What is Docker
================

Key concepts
----------------


* Defined environment for launching processes
* Clean separation of environments
* Sandbox with defined resources
* One simple interface for launching applications

What is Docker not!
--------------------
* Not a virtualisation
* No seperate kernel
* No hypervisor

Installation
===============
Docker is linux based, but there exist convienent solutions to work on Windows and Mac OS X also.

Detailed Instructions: <https://docs.docker.com/installation/>

The simple way for installation in Ubuntu and Debian:

    curl https://get.docker.com/ | sh
      
The docker hello world
=========================

    docker run busybox echo 'Hello World'

What has happened?

* Download the image `busybox`
* Create a new container
* Execute the `echo` command within the new container
          
Images and Containers
==========================

Docker Image
---------------

* A template for containers
* Can be pulled and pushed towards a registry
* Image names have the form `[registry/][user/]name[:tag]`
* The default for the tag is `latest`

Docker Container
---------------

* An instance of an image
* Maintains changes within the filesystems
* Can be started, stopped, restarted, ..
      
      
Commands for image handling
==============================

search, pull & push
----------------------

searching in the registry:

    docker search <term>

download or update an image from the registry:

    docker pull <image>

upload an image to the registry:

    docker push <image>

Commands for image handling
==============================

list, tag & delete
----------------------

listing of downloaded images:

    docker images

give an image a new name (alias):

    docker tag <oldname> <newname>

delete an image locally:

    docker rmi <image>

Docker run
===============

Start a new container

    docker run <imagename>

My favorite run options:
    
    Usage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
     --name             Give the container a symbolic name
     -v, --volume=[]    Bind mount a volume
     -p, --publish=[]   Publish a container's port(s) to the host
     -e, --env=[]       Set environment variables
     --link=[]          Add link to another container
     --restart="no"     Restart policy (no, on-failure[:max-retry], always)
     --rm=false         Automatically remove the container when it exits
     -d, --detach=false Run container in background and print container ID
     -a, --attach=[]    Attach to STDIN, STDOUT or STDERR
     -i, --interactive=false   Keep STDIN open even if not attached

Exercise:
----------
Start an nginx web server with a custom `index.html` file.

See your containers:
========================

List containers
-----------------
The running containers:

    docker ps

All containers:

    docker ps -a

Show Metadata of a container
-----------------------------

    docker inspect <container>

Output a special field of the metadata:

    docker inspect --format='{{.Image}}' <container>


Container Livecycle
=========================

Stop running containers:

    docker stop <container..>

Start stopped containers:

    docker start <container..>

Kill running containers:

    docker kill <container..>

Remove containers:

    docker rm <container..>


Useful tricks: Container Id
==============================

give your containers a name

    docker run --name my_webserver nginx
    docker rm -f my_webserver

save the container id in shell variables

    c=$(docker run -d nginx)
    docker rm -f $c

start containers in foreground and with `--rm`, when playing arround:

    docker run --rm nginx


Interaction and debugging
==========================

exec
-----

Run a command in an existing container, e.g start a shell

    docker exec <container> <command>
    docker exec -it <container> bash

logs
--------
See the logs (stdout) of the container.

    docker logs -f <container>

copy
-------
copy files from and to docker container, e.g.

    docker cp my_webserver:/etc/nginx/nginx.conf ~/

Interaction and debugging
==========================

Exercise
----------
1. Start a webserver
2. Overwrite the content of the index.html
3. Watch the webserver logs
4. compare the output of `ps aux` from your container with the host


Modify a container
===================

Inspect changes on a container's filesystem

    docker diff <container>

Create a new image from a container's changes:

    docker commit <container> <imagename>

Note:
-------

- Docker uses layered filesystems, so images and containers only need to store the diff to the their base image


Modify a container
==========================

Exercise
----------
1. Search online for the docker registry image 
1. Start a private a docker image registry
    - Search for the image at <https://hub.docker.com/>
    - Start the image local
1. Commit your containers changes from the previous exercise
1. Push your new image to your private registry
1. Delete the image local
1. Start the image again (now comming from the registry)

Useful tricks: Cleanup Script
=======================================
You have to cleanup your local images and old containers regulary.

    docker rm $(docker ps -q -a -f status=exited)
    docker rmi $(docker images -q -f dangling=true)


Especially on test and build systems this should be part of a cron job.

    
    exited=$(docker ps -q -a -f status=exited | wc -l)
    
    if [ "$exited" != "0" ]; then
            docker rm $(docker ps -q -a -f status=exited)
    fi
    
    tagref=$(docker images -q -f dangling=true | wc -l)

    if [ "$tagref" != "0" ]; then
            docker rmi $(docker images -q -f dangling=true)
    fi

Dockerfiles
=====================

The normal way to create images is through `Dockerfile` build descriptions.

1. create a `Dockerfile`, e.g.

        FROM nginx
        COPY index.html /usr/share/nginx/html/
    
2. build the image an give it a name

        docker build -t my-nginx .
      
Note:
---------------------
- The build has the current directory as context
- All paths are relative to the Dockerfile
- Each command in the Dockerfile creates a new (temporary container)
- Every creation steps is cached, so repeated builds are fast


Dockerfiles FROM & MAINTAINER
=====================

FROM
--------

The `FROM` instruction sets the Base Image:

    FROM <image>:<tag>

Example: 

    FROM nginx:15:04

MAINTAINER
-------------

The `MAINTAINER` instruction sets the Author:

    MAINTAINER <name>

Example: 

    MAINTAINER Sebastian Mancke <s.mancke@tarent.de>


Dockerfiles CMD
=====================

CMD
--------

With `CMD` you can specify the default command to execute on container startup.
It has who forms.

The exec form (preferred):

    CMD ["executable","param1","param2"]

The shell form:

    CMD executable param1 param2

__Attention__: the shell form starts the command in a sub process, so it will not get
the process id 1 and will not receive all signals e.g. from command line or `docker stop`.

Example: 

    CMD ["nginx", "-g", "daemon off;"]

Dockerfiles RUN
=====================

RUN
--------

The `RUN` command allows to execute commands arbitary commands in the container, which modify the
file system and produce a new layered container.

    RUN <command>

It is common to tie related commands together into one RUN command, using shell magic.

Example: 

    RUN apt-get update && \
        apt-get install -y ca-certificates nginx=${NGINX_VERSION} && \
        rm -rf /var/lib/apt/lists/*


Dockerfiles COPY
=====================

COPY
--------
`COPY` can be used to copy files or directories to the image.

    COPY <src>... <dest>

- Source can contain wildcards
- If dest does not exist it will be created

Example: 

    COPY service.config /etc/service/
    COPY service.config /etc/service/myconfig.cfg
    COPY *.config /etc/service/
    COPY cfg/ /etc/service/

Dockerfiles ADD
=====================

ADD
--------
`ADD` can do the same as `COPY` with the following additions:

- If src is an URL, the file is downloaded
- If src is a local tar archive, it will be extracted to dest

Example: 

    ADD https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.4.tar.gz /es/
    RUN cd /es && tar xvfz elasticsearch-1.4.4.tar.gz

    ADD configs.tar.gz /etc/service/


Further reading
===============
[docker.com](https://www.docker.com)

[Commandline reference](https://docs.docker.com/reference/commandline/cli/)

[Dockerfile reference](https://docs.docker.com/reference/builder/)

[Docker Registry](https://hub.docker.com/)
