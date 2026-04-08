from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

def get_legal_chunks(markdown_text):

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


