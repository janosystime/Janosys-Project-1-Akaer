FROM mysql:8.4

# Scripts em init/ rodam na primeira inicialização do container
# (apenas quando o volume de dados ainda está vazio).
COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306
