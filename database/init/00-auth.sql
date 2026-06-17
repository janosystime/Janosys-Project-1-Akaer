-- Roda na primeira inicialização do container.
-- O MySQL 8.4 desativa o mysql_native_password por padrão; o serviço sobe com
-- --mysql-native-password=ON (ver docker-compose.yml) e aqui ajustamos o root
-- de acesso remoto para esse plugin, que o adapter MariaDB do backend usa sem atrito.
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
