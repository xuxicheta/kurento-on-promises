FROM kurento/kurento-media-server:xenial-latest

# RUN apt-get update
# RUN apt-get install chromium-codecs-ffmpeg

EXPOSE 8888
ENV GST_DEBUG=Kurento*:5
ENTRYPOINT ["/entrypoint.sh"]