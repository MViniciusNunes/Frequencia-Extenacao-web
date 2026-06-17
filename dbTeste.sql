create database userdb;

use userdb;

create table users (
	id int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) unique not null,
    usuario varchar(100) unique not null,
    senha varchar(100) not null
);

INSERT INTO users (nome, email, usuario, senha) VALUES ('admin', 'admin@gmail.com', 'admin', '1234');

select * from users;