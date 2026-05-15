import json
import logging
import asyncio
from confluent_kafka import Consumer, KafkaError
from app.services.kafka_producer import send_audit_result, flush_producer

from app.config.settings import settings
from  app.services.processor import process_upload
from app.services.auditor import LegalAuditor
from datetime import datetime

logger = logging.getLogger(__name__)
_auditor = None

def get_auditor() -> LegalAuditor:
    global _auditor
    if _auditor is None:
        logger.info("Initializing legal auditor - loading embedding model")
        _auditor = LegalAuditor()
        logger.info("Legal auditor Ready")

    return _auditor

def _create_consumer() -> Consumer:
    return Consumer({
        "bootstrap.servers":settings.kafka_bootstrap_servers,
        "group.id": "python-audit-worker-group",
        "auto.offset.reset": "earliest",
        "enable.auto.commit":False,
        "max.poll.interval.ms":600000,
        "session.timeout.ms":45000,
    })


async def _process_audit_request(message_value:dict):

    contract_id = message_value.get("contractId")
    filename = message_value.get("filename","unknown")
    file_path = message_value.get("fileStoragePath", "")
    user_id = message_value.get("userId")

    with open(file_path, "rb") as f:
        content_bytes = f.read()

    markdown_text = await process_upload(filename , content_bytes)

    audit_response = await get_auditor().analyze_contract(filename, markdown_text)

    violations = [
        {
            "chunkIndex": v.chunk_index,
            "chunkText": v.chunk_text,
            "severity" : v.severity.value,
            "legalPrinciple" : v.legal_principle,
            "matchedPolicy" : v.matched_policy,
            "confidence" : v.confidence,
            "reasoning" : v.reasoning,
            "sourceFile" : v.source_file,
        }
        for v in audit_response.violations
    ]

    result_payload = {
        "contractId": contract_id,
        "userId": user_id,
        "filename": filename,
        "totalViolations": audit_response.total_violations,
        "violations": violations,
        "processedAt":datetime.now().isoformat()
    }

    send_audit_result(result_payload)

    logger.info(
        f"Audit complete — contractId={contract_id}, "
        f"violations={audit_response.total_violations}"
    )


def start_consumer_loop():
    consumer = _create_consumer()
    consumer.subscribe(["contract.audit.request"])
    try:

        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                continue

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    logger.debug("Reached end of partition. Waiting for new messages")
                else:
                    logger.error(f"Consumer error : {msg.error()}")
                continue

            try:
                value = json.loads(msg.value().decode("utf-8"))
                asyncio.run(_process_audit_request(value))
                consumer.commit(message=msg)

                logger.info(f"Offset commited - partition= {msg.partition()} offset= {msg.offset()}")

            except Exception as e:
                logger.error(
                    f"failed to process contractId="
                    f"{json.loads(msg.value().decode("utf-8")).get('contractId','?')}"
                    f"- {e}",
                    exc_info=True
                )

    except KeyboardInterrupt:
        logger.info("Kafka Consumer shutting down gracefully")

    finally:
        consumer.close()
        flush_producer()
        logger.info("Kafka Consumer stopped")










