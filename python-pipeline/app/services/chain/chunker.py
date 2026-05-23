from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
import logging
logger = logging.getLogger(__name__)

def get_legal_chunks(markdown_text):
    if not markdown_text or len(markdown_text.strip())==0:
        logger.warning("Empty markdown_text, skipping chunking")
        return []

    try:
        headers = [
            ("#", "Header1"),
            ("##", "Header2"),
            ("###", "Header3"),
        ]

        header_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers)

        header_splits = header_splitter.split_text(markdown_text)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 1000,
            chunk_overlap=200,
            separators=["\n\n","\n","Section","Clause","Rule", ".", " "]
        )

        chunks = text_splitter.split_documents(header_splits)
        return chunks

    except Exception as e:
        logger.error(f"Failed to create chunks : {str(e)}")
        raise RuntimeError(f"Processing failed for the current document : {str(e)}") from e


