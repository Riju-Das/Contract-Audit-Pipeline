import json
import logging
from confluent_kafka import Producer
from app.config.settings import settings

logger = logging.getLogger(__name__)

_producer = None

def get_producer() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer({
            "bootstrap.servers":settings.kafka_bootstrap_servers,
            "client.id": "python-audit-worker-producer"
        })
        logger.info("Kafka Producer initialized")

    return _producer

def _delivery_report(err,msg):
    if err:
        logger.error(f"Delivery Failed: {err}")
    else:
        logger.info(
            f"Message delivered, topic: {msg.topic()} "
            f"partition: {msg.partition()}, offset: {msg.offset()}"
        )

def send_audit_result(result_payload: dict):
    producer = get_producer()
    producer.produce(
        topic="contract.audit.result",
        key=str(result_payload.get("contractId", "")),
        value = json.dumps(result_payload).encode("utf-8"),
        callback =  _delivery_report,
    )
    producer.poll(0)

def flush_producer():
    if _producer is not None:
        logger.info("Flushing kafka producer...")
        _producer.flush()
        logger.info("Kafka producer flushed")

