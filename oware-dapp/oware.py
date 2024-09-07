from os import environ
import logging
import requests
from utils.utils import HexConverter
from utils.oware_handlers import handlers

hexConverter = HexConverter()


logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:

        rollup_request = response.json()
        data = rollup_request["data"]
        request_type = rollup_request["request_type"]
        logger.info(f"Received data {data}")
        handler = handlers[request_type]
        finish["status"] = handler(rollup_request["data"])
        

