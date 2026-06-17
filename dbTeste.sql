create database userdb;

use userdb;

create table users (
	id int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null,
    usuario varchar(100) not null,
    senha varchar(100) not null
);

select * from users;