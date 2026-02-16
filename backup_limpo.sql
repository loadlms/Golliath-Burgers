--
-- PostgreSQL database dump
--

\restrict vAb166KtCjUt3xGm3qj3accRbRgtLns8Xe7nBGBVIS7RJXxXzl4WjRq4z4bHuHW

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cardapio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cardapio (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    preco numeric(10,2) NOT NULL,
    categoria character varying(100),
    imagem text,
    disponivel boolean DEFAULT true,
    destaque boolean DEFAULT false,
    ordem integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: cardapio_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cardapio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cardapio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cardapio_id_seq OWNED BY public.cardapio.id;


--
-- Name: cardapio id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cardapio ALTER COLUMN id SET DEFAULT nextval('public.cardapio_id_seq'::regclass);


--
-- Data for Name: cardapio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cardapio (id, nome, descricao, preco, categoria, imagem, disponivel, destaque, ordem, "isActive", "createdAt", "updatedAt") FROM stdin;
2	GOLLIATH TRIPLO P.C.Q	3x mais carne, 3x mais queijo. Com 3 Burguers de 90g totalizando 270g de carne, e com fatias de American Cheese, no pão brioche tostado na manteiga.	32.90	hamburguers	/img/_MG_0191.jpg	t	t	2	t	2025-01-20 12:00:00+00	2025-01-20 12:00:00+00
3	GOLLIATH TRIPLO BACON	3x mais carne, 3x mais queijo e 3x mais bacon. Com 3 Burguers de 90g totalizando 270g de carne, com fatias de American Cheese, 2 fatias de bacon por andar, e molho especial de Golliath no pão brioche tostado na manteiga.	39.90	hamburguers	/img/_MG_0309.jpg	t	t	3	t	2025-01-20 12:00:00+00	2025-01-20 12:00:00+00
4	GOLLIATH OKLAHOMA	4 burguers de 90g ao estilo Oklahoma, totalizando 360g de blend, com 4 fatias de queijo cheddar, no pão brioche selado na manteiga.	49.90	hamburguers	/img/_MG_6201.jpg	t	t	4	t	2025-01-20 12:00:00+00	2025-01-20 12:00:00+00
225	Prensadinho De Golliath 	O que acontece se smashar o smash ? Prove e saberá\n\nEsse sucesso conta com 2 smashs a lê crostê, american cheese e é prensado no pão brioche. 	19.90	hamburguers	https://ik.imagekit.io/loadlm/produtos/produto-1758570464541-bc19722e_hS7QuppvcM.jpg	t	t	777	t	2025-09-22 19:47:49.021+00	2025-09-22 19:47:49.021+00
224	GOLLIATH Duplo Vulcan	Duplo burger de 90g, 2 fatias de queijo American Cheese, 4 tiras de bacon, picles e molho especial de Golliath no pão de brioche vulcanizado tostado na manteiga e batatas fritas com bacon no topo.   	44.90	hamburguers	https://ik.imagekit.io/loadlm/produtos/produto-1758571581141-88047270_GU74Mgp98.jpg	t	f	1	t	2025-09-22 18:19:02.358+00	2025-09-22 20:06:23.772+00
12	GOLLIATH P.C.Q	Burger de 90g, com American Chese no pão brioche tostado na manteiga.	19.90	hamburguers	https://ik.imagekit.io/loadlm/produtos/produto-1758561878712-7f558937_Io_IcQ4zU.jpg	t	f	1	t	2025-09-14 02:05:03.155+00	2025-09-22 17:24:41.669+00
1	X BACON DE GOLIATH	Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.	24.90	hamburguers	https://ik.imagekit.io/loadlm/produtos/produto-1758562227009-24277ac5_z-csqin7D.jpg	t	t	1	t	2025-01-20 12:00:00+00	2025-09-22 18:10:38.939+00
223	GOLLIATH DUPLO BACON	2x 90 de burger do nosso blend selecionado, 2 fatias de American Cheese, bacon em fatias, pão de brioche na manteiga tostada.	27.90	hamburguers	https://ik.imagekit.io/loadlm/produtos/produto-1758563942872-7ab4236a_TAB-XRvHmV.jpg	t	t	3	t	2025-09-22 17:59:19.268+00	2025-09-22 18:13:12.336+00
\.


--
-- Name: cardapio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cardapio_id_seq', 226, true);


--
-- Name: cardapio cardapio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cardapio
    ADD CONSTRAINT cardapio_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict vAb166KtCjUt3xGm3qj3accRbRgtLns8Xe7nBGBVIS7RJXxXzl4WjRq4z4bHuHW

